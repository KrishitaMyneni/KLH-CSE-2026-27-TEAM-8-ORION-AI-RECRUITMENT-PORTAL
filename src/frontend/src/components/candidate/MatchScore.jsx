function MatchScore({ score = 0 }) {
  return (
    <div className="match-score">
      <div className="match-score-value">
        {score}%
      </div>

      <div className="match-score-label">
        AI Match Score
      </div>
    </div>
  );
}

export default MatchScore;