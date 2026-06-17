import { ProjectForm } from '@/components/features/projects/ProjectForm';

export default function NewProjectPage() {
  return (
    <div style={{ maxWidth: 480 }}>
      <p
        style={{
          fontSize:      11,
          color:         'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          margin:        '0 0 4px',
        }}
      >
        Collaboration
      </p>
      <h2
        style={{
          margin:     '0 0 28px',
          fontSize:   26,
          fontWeight: 800,
          color:      'var(--color-text-heading)',
          lineHeight: 1.2,
        }}
      >
        New Project
      </h2>
      <ProjectForm mode="create" />
    </div>
  );
}
