export const checkWin = (board: number[], player: number): boolean => {
  const winPatterns = [
    [0, 1, 2], // rows
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // columns
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // diagonals
    [2, 4, 6],
  ];

  return winPatterns.some((pattern) =>
    pattern.every((index) => board[index] === player),
  );
};
