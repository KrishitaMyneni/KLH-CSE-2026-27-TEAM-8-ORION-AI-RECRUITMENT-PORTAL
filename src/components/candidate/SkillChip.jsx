function SkillChip({ skill, type = "default" }) {
  return (
    <span className={`skill-chip skill-chip-${type}`}>
      {skill}
    </span>
  );
}

export default SkillChip;