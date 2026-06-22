interface Props {
  value: string;
  onChange: (value: string) => void;
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'cpp', label: 'C++', icon: '⚡' },
  { value: 'c', label: 'C', icon: '🔧' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'go', label: 'Go', icon: '🐹' },
];

export default function LanguageSelector({ value, onChange }: Props) {
  return (
    <div className="language-selector">
      <select
        className="language-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.icon} {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
