import { connectDB } from '@/lib/db';
import Staff from '@/models/Staff';
import bcrypt from 'bcryptjs';

const sampleStaff = [
  // Library Department
  {
    name: "Library Assistant",
    email: "library.assistant@college.edu",
    phone: "9876543210",
    department: "library",
    role: "Assistant",
    collegeId: "COL001", 
    password: "library123",
    isActive: true,
    assignedComplaints: 0,
    resolvedComplaints: 0,
    escalatedComplaints: 0,
    performanceScore: 100
  },
  {
    name: "Library Supervisor",
    email: "library.supervisor@college.edu",
    phone: "9876543211",
    department: "library",
    role: "Supervisor",
    collegeId: "COL001",
    password: "library345",
    isActive: true,
    assignedComplaints: 0,
    resolvedComplaints: 0,
    escalatedComplaints: 0,
    performanceScore: 100
  },
  {
    name: "Head Librarian",
    email: "head.librarian@college.edu",
    phone: "9876543212",
    department: "library",
    role: "Director",
    collegeId: "COL001",
    password: "library567",
    isActive: true,
    assignedComplaints: 0,
    resolvedComplaints: 0,
    escalatedComplaints: 0,
    performanceScore: 100
  },

  // Hostel Department
  {
    name: "Hostel Warden",
    email: "hostel.warden@college.edu",
    phone: "9876543213",
    department: "hostel",
    role: "Warden",
    collegeId: "COL001",
    password: "hostel123",
    isActive: true,
    assignedComplaints: 0,
    resolvedComplaints: 0,
    escalatedComplaints: 0,
    performanceScore: 100
  },
  {
    name: "Assistant Warden",
    email: "assistant.warden@college.edu",
    phone: "9876543214",
    department: "hostel",
    role: "Supervisor",
    collegeId: "COL001",
    password: "hostel345",
    isActive: true,
    assignedComplaints: 0,
    resolvedComplaints: 0,
    escalatedComplaints: 0,
    performanceScore: 100
  },

  // Academic Department
  {
    name: "Academic Coordinator",
    email: "academic.coordinator@college.edu",
    phone: "9876543215",
    department: "academic",
    role: "Coordinator",
    collegeId: "COL001",
    password: "academic123",
    isActive: true,
    assignedComplaints: 0,
    resolvedComplaints: 0,
    escalatedComplaints: 0,
    performanceScore: 100
  },
  {
    name: "Department Head",
    email: "department.head@college.edu",
    phone: "9876543216",
    department: "academic",
    role: "Director",
    collegeId: "COL001",
    password: "academic345",
    isActive: true,
    assignedComplaints: 0,
    resolvedComplaints: 0,
    escalatedComplaints: 0,
    performanceScore: 100
  },

  // Infrastructure Department
  {
    name: "Maintenance Engineer",
    email: "maintenance@college.edu",
    phone: "9876543217",
    department: "infrastructure",
    role: "Engineer",
    collegeId: "COL001",
    password: "infra123",
    isActive: true,
    assignedComplaints: 0,
    resolvedComplaints: 0,
    escalatedComplaints: 0,
    performanceScore: 100
  },
  {
    name: "Civil Engineer",
    email: "civil.engineer@college.edu",
    phone: "9876543218",
    department: "infrastructure",
    role: "Supervisor",
    collegeId: "COL001",
    password: "infra345",
    isActive: true,
    assignedComplaints: 0,
    resolvedComplaints: 0,
    escalatedComplaints: 0,
    performanceScore: 100
  },

  // Cafeteria Department
  {
    name: "Cafeteria Manager",
    email: "cafeteria.manager@college.edu",
    phone: "9876543219",
    department: "cafeteria",
    role: "Manager",
    collegeId: "COL001",
    password: "cafe123",
    isActive: true,
    assignedComplaints: 0,
    resolvedComplaints: 0,
    escalatedComplaints: 0,
    performanceScore: 100
  },

  // Sports Department
  {
    name: "Sports Coordinator",
    email: "sports.coordinator@college.edu",
    phone: "9876543220",
    department: "sports",
    role: "Coordinator",
    collegeId: "COL001",
    password: "sports123",
    isActive: true,
    assignedComplaints: 0,
    resolvedComplaints: 0,
    escalatedComplaints: 0,
    performanceScore: 100
  },

  // Other/General Department
  {
    name: "General Administrator",
    email: "general.admin@college.edu",
    phone: "9876543221",
    department: "other",
    role: "Administrator",
    collegeId: "COL001",
    password: "gene123",
    isActive: true,
    assignedComplaints: 0,
    resolvedComplaints: 0,
    escalatedComplaints: 0,
    performanceScore: 100
  }
];

async function seedStaff() {
  try {
    await connectDB();
    
    // Clear existing staff
    await Staff.deleteMany({});
    console.log('✅ Cleared existing staff data');
    
    // Hash passwords before inserting
    const staffWithHashedPasswords = await Promise.all(
      sampleStaff.map(async (staff) => {
        const hashedPassword = await bcrypt.hash(staff.password, 12);
        return {
          ...staff,
          password: hashedPassword
        };
      })
    );
    
    // Insert new staff with hashed passwords
    await Staff.insertMany(staffWithHashedPasswords);
    console.log('✅ Staff data seeded successfully');
    
    // Display summary
    const staffCount = await Staff.countDocuments();
    const departments = await Staff.distinct('department');
    
    console.log(`\n📊 Staff Summary:`);
    console.log(`Total Staff: ${staffCount}`);
    console.log(`Departments: ${departments.join(', ')}`);
    
    // Show staff by department
    for (const dept of departments) {
      const deptStaff = await Staff.find({ department: dept }).select('name role email');
      console.log(`\n${dept.toUpperCase()} Department:`);
      deptStaff.forEach(staff => {
        console.log(`  - ${staff.name} (${staff.role}) - ${staff.email}`);
      });
    }
    
    console.log('\n🔐 All passwords have been securely hashed');
    console.log('📧 Staff can now login with their email and password');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding staff data:', error);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  seedStaff();
}

export default seedStaff;