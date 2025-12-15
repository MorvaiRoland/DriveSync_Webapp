// components/showroom/VotingCard.tsx
'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Heart } from 'lucide-react' // Vagy az általad használt ikon csomag
import { toggleBattleVote } from '@/app/actions/showroom'

interface VotingCardProps {
  entryId: string
  carName: string
  imageUrl: string
  initialVotes: number
}

export default function VotingCard({ entryId, carName, imageUrl, initialVotes }: VotingCardProps) {
  const [votes, setVotes] = useState(initialVotes)
  const [isLiked, setIsLiked] = useState(false) // Ezt le kéne kérni szerverről, de MVP-nek jó így
  const [isVoting, setIsVoting] = useState(false)

  const handleVote = async () => {
    if (isVoting) return
    setIsVoting(true)
    
    // Optimista UI frissítés (azonnal mutatjuk az eredményt)
    setVotes(prev => isLiked ? prev - 1 : prev + 1)
    setIsLiked(!isLiked)

    try {
      await toggleBattleVote(entryId)
    } catch (error) {
      // Ha hiba volt, visszavonjuk az optimista frissítést
      setVotes(prev => isLiked ? prev + 1 : prev - 1)
      setIsLiked(isLiked)
      console.error('Voting failed')
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="relative w-full max-w-sm mx-auto bg-white rounded-3xl shadow-xl overflow-hidden aspect-[3/4]">
      {/* Autó képe */}
      <div className="relative h-full w-full">
         <Image 
           src={imageUrl || '/placeholder-car.jpg'} 
           alt={carName}
           fill
           className="object-cover"
         />
         {/* Sötétítés alul a szövegnek */}
         <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>

      {/* Adatok és Like gomb */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">{carName}</h3>
          <p className="text-gray-300 text-sm">{votes} szavazat</p>
        </div>

        <button 
          onClick={handleVote}
          disabled={isVoting}
          className={`p-4 rounded-full transition-all transform active:scale-90 ${isLiked ? 'bg-red-500 text-white' : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30'}`}
        >
          <Heart className={`w-8 h-8 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
  )
}