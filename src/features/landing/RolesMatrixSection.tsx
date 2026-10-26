import { Check, Minus, ShieldCheck, UserCheck, Users } from 'lucide-react';
import { RoleBadge } from '../../components/ui';

interface PermissionRow {
  capability: string;
  admin: boolean;
  projectAdmin: boolean;
  member: boolean;
  description: string;
}

const PERMISSION_MATRIX: PermissionRow[] = [
  {
    capability: 'Project Edit & Dismantle',
    admin: true,
    projectAdmin: false,
    member: false,
    description: 'Update project title, description, or permanently delete the workspace',
  },
  {
    capability: 'Member Management',
    admin: true,
    projectAdmin: false,
    member: false,
    description: 'Invite members by email, update roles, or remove participants',
  },
  {
    capability: 'Notes Authoring',
    admin: true,
    projectAdmin: false,
    member: false,
    description: 'Create, edit, and delete shared expedition field notes',
  },
  {
    capability: 'Task Creation & Management',
    admin: true,
    projectAdmin: true,
    member: false,
    description: 'Create, update, move, or delete waypoint tasks and upload attachments',
  },
  {
    capability: 'Subtask Management',
    admin: true,
    projectAdmin: true,
    member: false,
    description: 'Create and remove nested subtask checkpoints within tasks',
  },
  {
    capability: 'Subtask Completion',
    admin: true,
    projectAdmin: true,
    member: true,
    description: 'Check off assigned subtasks as completed milestones along the route',
  },
  {
    capability: 'Resource Viewing',
    admin: true,
    projectAdmin: true,
    member: true,
    description: 'Inspect tasks, Kanban boards, attachments, notes, and team rosters',
  },
];

export function RolesMatrixSection() {
  return (
    <section id="roles" className="py-20 px-6 max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="font-mono text-xs text-accent font-semibold tracking-wider uppercase">
          Governance & Permissions
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-text tracking-tight">
          Role-Based Access Control Built for Scale
        </h2>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
          Every project establishes its own independent access boundary. Team roles are validated on the server for every mutation.
        </p>
      </div>

      <div className="border border-border rounded-md overflow-x-auto bg-surface shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-surface-raised/60">
              <th className="p-4 font-semibold text-text">Workspace Capability</th>
              <th className="p-4 font-semibold text-center whitespace-nowrap">
                <div className="inline-flex flex-col items-center gap-1">
                  <RoleBadge role="admin" />
                  <span className="text-[10px] text-text-muted font-normal">Full Control</span>
                </div>
              </th>
              <th className="p-4 font-semibold text-center whitespace-nowrap">
                <div className="inline-flex flex-col items-center gap-1">
                  <RoleBadge role="project_admin" />
                  <span className="text-[10px] text-text-muted font-normal">Task Lead</span>
                </div>
              </th>
              <th className="p-4 font-semibold text-center whitespace-nowrap">
                <div className="inline-flex flex-col items-center gap-1">
                  <RoleBadge role="member" />
                  <span className="text-[10px] text-text-muted font-normal">Contributor</span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {PERMISSION_MATRIX.map((row, idx) => (
              <tr key={idx} className="hover:bg-surface-raised/30 transition-colors">
                <td className="p-4 align-top">
                  <p className="font-medium text-text">{row.capability}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{row.description}</p>
                </td>

                <td className="p-4 text-center align-middle">
                  {row.admin ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 mx-auto">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <Minus className="w-3.5 h-3.5 text-text-muted/40 mx-auto" />
                  )}
                </td>

                <td className="p-4 text-center align-middle">
                  {row.projectAdmin ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 mx-auto">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <Minus className="w-3.5 h-3.5 text-text-muted/40 mx-auto" />
                  )}
                </td>

                <td className="p-4 text-center align-middle">
                  {row.member ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 mx-auto">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <Minus className="w-3.5 h-3.5 text-text-muted/40 mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
