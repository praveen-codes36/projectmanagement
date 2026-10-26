import { User } from './models/User';
import { Project } from './models/Project';
import { ProjectMember } from './models/ProjectMember';
import { Task } from './models/Task';
import { Subtask } from './models/Subtask';
import { ProjectNote } from './models/ProjectNote';
import { UserRolesEnum, TaskStatusEnum } from './utils/constants';

export async function seedInitialData() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return;
    }

    console.log('Seeding initial expedition data into database...');

    // 1. Create Default Users
    const alex = await User.create({
      username: 'alex',
      email: 'alex@camp.internal',
      password: 'Expedition2026!',
      fullName: 'Alex Mercer',
      avatar: {
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        localPath: '',
      },
      isEmailVerified: true,
    });

    const sara = await User.create({
      username: 'sara',
      email: 'sara@camp.internal',
      password: 'Expedition2026!',
      fullName: 'Sara Lin',
      avatar: {
        url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        localPath: '',
      },
      isEmailVerified: true,
    });

    // 2. Create Default Expedition Project
    const project = await Project.create({
      name: 'Annapurna High Pass Expedition',
      description: 'Multi-stage high-altitude route survey, base camp logistics, and telemetry beacon deployment.',
      createdBy: alex._id,
    });

    // 3. Create Project Memberships
    await ProjectMember.create({
      project: project._id,
      user: alex._id,
      role: UserRolesEnum.ADMIN,
    });

    await ProjectMember.create({
      project: project._id,
      user: sara._id,
      role: UserRolesEnum.PROJECT_ADMIN,
    });

    // 4. Create Expedition Tasks
    const task1 = await Task.create({
      title: 'Base Camp Radio Repeater Setup',
      description: 'Establish UHF/VHF crossband repeater at Ridge Point Charlie (4,200m). Ensure solar battery buffer is online.',
      project: project._id,
      assignedTo: alex._id,
      assignedBy: alex._id,
      status: TaskStatusEnum.DONE,
      attachments: [
        {
          url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600',
          originalname: 'repeater_rig.jpg',
          mimetype: 'image/jpeg',
          size: 482100,
        },
      ],
    });

    const task2 = await Task.create({
      title: 'Survey Thorong La Pass Coordinates',
      description: 'Perform real-time RTK GPS coordinate calibration across north and south access couloirs.',
      project: project._id,
      assignedTo: sara._id,
      assignedBy: alex._id,
      status: TaskStatusEnum.IN_PROGRESS,
    });

    const task3 = await Task.create({
      title: 'Install Solar Telemetry Mast at Camp II',
      description: 'Bolt high-wind carbon mast onto Granite Shelf Bivouac. Calibrate barometric pressure sensor for telemetry.',
      project: project._id,
      assignedTo: alex._id,
      assignedBy: alex._id,
      status: TaskStatusEnum.TODO,
    });

    // 5. Create Subtasks
    await Subtask.create({
      title: 'Check antenna VSWR ratio below 1.5:1',
      task: task1._id,
      isCompleted: true,
      createdBy: alex._id,
    });

    await Subtask.create({
      title: 'Confirm dual battery bank charging at 14.4V',
      task: task1._id,
      isCompleted: true,
      createdBy: alex._id,
    });

    await Subtask.create({
      title: 'Map waypoint alpha at 5,100m elevation',
      task: task2._id,
      isCompleted: true,
      createdBy: sara._id,
    });

    await Subtask.create({
      title: 'Verify satellite uplink latency under 450ms',
      task: task2._id,
      isCompleted: false,
      createdBy: sara._id,
    });

    // 6. Create Expedition Note
    await ProjectNote.create({
      project: project._id,
      createdBy: alex._id,
      content: 'Acclimatization day 3 complete. Weather window stable with westerly winds under 25 knots. High-pass ascent scheduled for 04:30 tomorrow.',
    });

    console.log('Seeding completed successfully: 2 users, 1 project, 3 tasks, 4 subtasks, 1 note.');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}
