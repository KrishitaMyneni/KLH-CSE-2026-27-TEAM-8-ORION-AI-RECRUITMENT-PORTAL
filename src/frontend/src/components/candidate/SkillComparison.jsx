import SkillChip from "./SkillChip";

function SkillComparision({
  matchedSkills = [],
  missingSkills = [],
}) {
  return (
    <div className="profile-card">
      <h3>Skill Comparison</h3>

      <div className="skill-comparison-section">
        <strong>Matched Skills</strong>

        <div className="skill-list">
          {matchedSkills.length > 0 ? (
            matchedSkills.map((skill, index) => (
              <SkillChip
                key={index}
                skill={skill}
                type="matched"
              />
            ))
          ) : (
            <p className="profile-muted">
              No matched skills found.
            </p>
          )}
        </div>
      </div>

      <div className="skill-comparison-section">
        <strong>Missing Skills</strong>

        <div className="skill-list">
          {missingSkills.length > 0 ? (
            missingSkills.map((skill, index) => (
              <SkillChip
                key={index}
                skill={skill}
                type="missing"
              />
            ))
          ) : (
            <p className="profile-muted">
              No missing skills found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SkillComparision;