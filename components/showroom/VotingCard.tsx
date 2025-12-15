'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Heart } from 'lucide-react'
import { toggleBattleVote } from '@/app/actions/showroom'

interface VotingCardProps {
  entryId: string
  carName: string
  imageUrl: string
  initialVotes: number
  currentUserVoted: boolean // <--- ÚJ PROP
}

export default function VotingCard({ entryId, carName, imageUrl, initialVotes, currentUserVoted }: VotingCardProps) {
  const [votes, setVotes] = useState(initialVotes)
  const [isLiked, setIsLiked] = useState(currentUserVoted) // <--- KEZDŐÉRTÉK
  const [isVoting, setIsVoting] = useState(false)

  const handleVote = async () => {
    if (isVoting) return
    setIsVoting(true)
    
    // Optimista UI
    setVotes(prev => isLiked ? prev - 1 : prev + 1)
    setIsLiked(!isLiked)

    try {
      await toggleBattleVote(entryId)
    } catch (error) {
      setVotes(prev => isLiked ? prev + 1 : prev - 1)
      setIsLiked(isLiked)
      console.error('Voting failed')
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="relative w-full max-w-sm mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden aspect-[3/4] border border-slate-100 dark:border-slate-700">
      {/* Autó képe */}
      <div className="relative h-full w-full">
         <Image 
           src={imageUrl || '/placeholder-car.jpg'} 
           alt={carName}
           fill
           className="object-cover"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90" />
      </div>

      {/* Adatok és Like gomb */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{carName}</h3>
          <p className="text-slate-300 text-sm font-bold flex items-center gap-1">
             <span className="text-white text-base">{votes}</span> szavazat
          </p>
        </div>

        <button 
          onClick={handleVote}
          disabled={isVoting}
          className={`p-3.5 rounded-full transition-all transform active:scale-90 shadow-lg ${
            isLiked 
                ? 'bg-red-500 text-white shadow-red-500/30' 
                : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20'
            }`}
        >
          <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  )
}