exports.evaluateSecurityFix = async (challengeData, userCode) => {
  const prompt = `
أنت نظام تقييم أمان للكود داخل Challenge Section باستخدام Gemini 2.5 Flash

الهدف
التحقق هل المستخدم قام بإغلاق الثغرة الأمنية الموجودة في الكود الأولي أم لا

المدخلات
* Title: ${challengeData.title}
* Description: ${challengeData.description}
* Level: ${challengeData.level}
* Initial Code: ${challengeData.initialCode}
* User Code: ${userCode}
* Recommendation: ${challengeData.recommendation}

فكرة العمل
* الكود الأولي يحتوي على ثغرة أمنية مقصودة
* المطلوب من المستخدم إصلاح الثغرة فقط
* لا يتم تقييم الوظيفة العامة للكود
* يتم مقارنة حالة الأمان فقط بين Initial Code و User Code

طريقة التحليل
* افهم الثغرة الموجودة في Initial Code
* تحقق هل User Code قام بإغلاق نفس الثغرة بشكل صحيح
* لا تعتبر أي تغيير غير متعلق بالثغرة مهم
* استخدم Recommendation للفهم فقط

حالات التقييم
* إذا الثغرة تم إغلاقها بشكل صحيح → المستخدم يحصل على كامل نقاط Level
* إذا الثغرة ما زالت موجودة أو تم إصلاحها بشكل خاطئ → المستخدم يحصل على 0 أو جزء من النقاط حسب الحالة

قواعد التقييم
* التركيز فقط على الثغرة المقصودة
* تجاهل أي تحسينات خارج نطاق الثغرة
* قبول أكثر من طريقة إصلاح صحيحة
* رفض أي إصلاح شكلي لا يمنع الاستغلال

أنواع الثغرات الممكنة
* Injection
* XSS
* Path Traversal
* IDOR
* Authentication flaw
* Authorization flaw
* Missing validation
* Unsafe input handling

الإخراج المطلوب
أرجع فقط JSON بدون أي نص إضافي

{
"fixed": boolean,
"feedback": string
}

feedback يجب أن يحتوي
* هل الثغرة تم إصلاحها أم لا
* شرح الثغرة الأصلية
* هل ما زال يمكن استغلالها أم لا
* إذا فشل المستخدم اشرح له أين الخطأ
* كيف يصلحها بطريقة صحيحة
* توجيه واضح لإعادة المحاولة

قواعد صارمة
* لا تقييم للوظيفة
* لا مقارنة عامة للكود
* لا خروج خارج JSON
* لا تقديم حل كامل جاهز
* التركيز فقط على الثغرة المقصودة في Initial Code
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const data = await response.json();

    console.log("RAW RESPONSE:", JSON.stringify(data, null, 2));

    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "";

    if (!text) {
      console.error("Empty response from Gemini:", data);
      return {
        fixed: false,
        feedback: 'حدث خطأ في تقييم الحل. يرجى المحاولة مرة أخرى.'
      };
    }

    // Parse the JSON response
    const evaluation = JSON.parse(text.trim());

    return evaluation;
  } catch (error) {
    console.error('Error evaluating security fix:', error);
    // Fallback: return not fixed if evaluation fails
    return {
      fixed: false,
      feedback: 'حدث خطأ في تقييم الحل. يرجى المحاولة مرة أخرى.'
    };
  }
};