"use client";

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useBlueWill } from '../../hooks/useBlueWill';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

interface QuizData {
  question: string;
  options: string[];
  votes: number[];
}

interface QuizDisplayProps {
  quiz: QuizData;
  postId: string;
}

export function QuizDisplay({ quiz, postId }: QuizDisplayProps) {
  const { user } = useAuth();
  const { addAlert } = useBlueWill();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [localQuiz, setLocalQuiz] = useState(quiz);

  const totalVotes = localQuiz.votes.reduce((a, b) => a + b, 0);

  const handleVote = async (optionIndex: number) => {
    if (!user || hasVoted) return;

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('quiz_votes')
      .select()
      .eq('post_id', postId)
      .eq('voter_id', user.id)
      .maybeSingle();

    if (existingVote) {
      addAlert({ type: 'info', title: 'Already voted', message: 'You can only vote once.' });
      setHasVoted(true);
      // Find the vote
      if ((existingVote as any).selected_option_index !== undefined) {
        setSelectedOption((existingVote as any).selected_option_index);
      }
      return;
    }

    // Record vote
    const { error } = await supabase.from('quiz_votes').insert([{
      post_id: postId,
      voter_id: user.id,
      selected_option_index: optionIndex,
    }]);

    if (error) {
      addAlert({ type: 'error', title: 'Vote failed', message: error.message });
      return;
    }

    // Update local state
    const newVotes = [...localQuiz.votes];
    newVotes[optionIndex]++;
    setLocalQuiz({ ...localQuiz, votes: newVotes });
    setSelectedOption(optionIndex);
    setHasVoted(true);
    addAlert({ type: 'success', title: 'Vote recorded!', message: '' });
  };

  const maxVotes = Math.max(...localQuiz.votes);

  return (
    <div className="bg-navy-800/50 rounded-xl p-4 mb-4 border border-white/10">
      <h4 className="font-semibold text-white mb-4">{localQuiz.question}</h4>

      <div className="space-y-2">
        {localQuiz.options.map((option, idx) => {
          const percentage = totalVotes > 0 ? Math.round((localQuiz.votes[idx] / totalVotes) * 100) : 0;
          const isWinner = localQuiz.votes[idx] === maxVotes && maxVotes > 0;
          const isSelected = selectedOption === idx;

          return (
            <button
              key={idx}
              onClick={() => handleVote(idx)}
              disabled={hasVoted}
              className={cn(
                "quiz-bar w-full p-3 text-left",
                isWinner && hasVoted && "winning",
                hasVoted && "cursor-default"
              )}
            >
              {hasVoted && (
                <div
                  className="quiz-fill"
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative flex items-center justify-between z-10">
                <span className={cn(
                  "text-sm",
                  isSelected ? "text-cyan-400 font-semibold" : "text-white"
                )}>
                  {option}
                </span>
                {hasVoted && (
                  <span className={cn(
                    "text-sm font-semibold",
                    isWinner ? "text-cyan-400" : "text-white/70"
                  )}>
                    {percentage}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-white/50 mt-3">
        {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
        {hasVoted && ' • You voted'}
      </p>
    </div>
  );
}
