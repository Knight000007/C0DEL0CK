/**
 * Game Mode Component
 * Tic-Tac-Toe game - must win to unlock early
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Gamepad2, RotateCcw, Trophy, Frown } from 'lucide-react';

interface GameModeProps {
  onWin: () => void;
}

type Player = 'X' | 'O' | null;
type Board = Player[];

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
];

function checkWinner(board: Board): Player {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function getAIMove(board: Board): number {
  // Simple AI: try to win, then block, then random
  const available = board.map((cell, i) => cell === null ? i : -1).filter(i => i !== -1);
  
  // Try to win
  for (const i of available) {
    const testBoard = [...board];
    testBoard[i] = 'O';
    if (checkWinner(testBoard) === 'O') return i;
  }
  
  // Block player
  for (const i of available) {
    const testBoard = [...board];
    testBoard[i] = 'X';
    if (checkWinner(testBoard) === 'X') return i;
  }
  
  // Take center if available
  if (available.includes(4)) return 4;
  
  // Take corner
  const corners = [0, 2, 6, 8].filter(i => available.includes(i));
  if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
  
  // Random
  return available[Math.floor(Math.random() * available.length)];
}

export function GameMode({ onWin }: GameModeProps) {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player>(null);
  const [playerTurn, setPlayerTurn] = useState(true);

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setGameOver(false);
    setWinner(null);
    setPlayerTurn(true);
  }, []);

  const handleMove = useCallback((index: number) => {
    if (board[index] || gameOver || !playerTurn) return;

    // Player move
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setPlayerTurn(false);

    // Check for winner
    const playerWon = checkWinner(newBoard);
    if (playerWon === 'X') {
      setGameOver(true);
      setWinner('X');
      setTimeout(onWin, 1500);
      return;
    }

    // Check for draw
    if (newBoard.every(cell => cell !== null)) {
      setGameOver(true);
      return;
    }

    // AI move after delay
    setTimeout(() => {
      const aiMove = getAIMove(newBoard);
      if (aiMove !== undefined) {
        const aiBoard = [...newBoard];
        aiBoard[aiMove] = 'O';
        setBoard(aiBoard);

        // Check for AI winner
        const aiWon = checkWinner(aiBoard);
        if (aiWon === 'O') {
          setGameOver(true);
          setWinner('O');
          return;
        }

        // Check for draw
        if (aiBoard.every(cell => cell !== null)) {
          setGameOver(true);
          return;
        }

        setPlayerTurn(true);
      }
    }, 500);
  }, [board, gameOver, playerTurn, onWin]);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center gap-3 justify-center">
          <Gamepad2 className="w-8 h-8 text-success" />
          <h2 className="text-3xl font-bold">Tic-Tac-Toe</h2>
        </div>
        <p className="text-muted-foreground">
          {gameOver 
            ? winner === 'X' 
              ? '🎉 You won! Unlocking early...' 
              : winner === 'O' 
                ? '😢 AI won. Try again!' 
                : '🤝 Draw! Try again!'
            : playerTurn 
              ? "Your turn (X)" 
              : "AI thinking..."
          }
        </p>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-3 p-6 rounded-2xl bg-card/50 border border-border">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleMove(index)}
            disabled={!!cell || gameOver || !playerTurn}
            className={`w-24 h-24 rounded-xl text-4xl font-bold transition-all duration-200 ${
              cell === 'X' 
                ? 'bg-primary/20 text-primary border-2 border-primary' 
                : cell === 'O' 
                  ? 'bg-destructive/20 text-destructive border-2 border-destructive'
                  : 'bg-muted hover:bg-muted/80 border-2 border-transparent hover:border-primary/50'
            } ${!cell && !gameOver && playerTurn ? 'cursor-pointer' : 'cursor-not-allowed'}`}
          >
            {cell}
          </button>
        ))}
      </div>

      {/* Result & Restart */}
      {gameOver && (
        <div className="space-y-4 animate-scale-in text-center">
          {winner === 'X' ? (
            <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-success/20 border border-success">
              <Trophy className="w-8 h-8 text-success" />
              <span className="text-xl font-bold text-success">Victory! Break complete.</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-destructive/20 border border-destructive">
                <Frown className="w-8 h-8 text-destructive" />
                <span className="text-xl font-bold text-destructive">
                  {winner === 'O' ? 'AI wins!' : "It's a draw!"}
                </span>
              </div>
              <Button variant="outline" size="lg" onClick={resetGame}>
                <RotateCcw className="w-4 h-4" />
                Try Again
              </Button>
            </>
          )}
        </div>
      )}

      {/* Instructions */}
      {!gameOver && (
        <p className="text-sm text-muted-foreground">
          Win against the AI to unlock early!
        </p>
      )}
    </div>
  );
}
