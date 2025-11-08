import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { fetchPuzzles } from '@/redux/slices/puzzleSlice'
import PageWrapper from '@/components/PageWrapper'
import PuzzleCard from '@/components/PuzzleCard'
import { Link } from 'react-router-dom'

const PuzzlePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { puzzles, status, error } = useSelector((state: RootState) => state.puzzles)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPuzzles())
    }
  }, [status, dispatch])

  return (
    <div className="relative animated-grid-bg">
      <PageWrapper>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white">Mind Puzzles</h1>
          <p className="text-slate-300 mt-2">Engage your brain and solve intricate puzzles.</p>
        </div>

        {status === 'loading' && <p className="text-center text-slate-300">Loading...</p>}
        {status === 'failed' && <p className="text-center text-red-500">{error}</p>}

        {status === 'succeeded' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {puzzles.map((puzzle, index) => (
              <Link to={`/puzzles/${puzzle._id}`} key={puzzle._id}>
                <PuzzleCard puzzle={puzzle} index={index} />
              </Link>
            ))}
          </div>
        )}
      </PageWrapper>
    </div>
  )
}

export default PuzzlePage
