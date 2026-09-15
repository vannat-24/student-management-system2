// composables/useI18n.ts
export type Locale = 'en' | 'km'

export interface TranslationDict {
  // Navigation & Common
  appTitle: string
  appSubtitle: string
  overview: string
  admin: string
  menuClass: string
  gradebook: string
  studentPortal: string
  login: string
  logout: string
  signUp: string
  signIn: string
  backToHome: string
  locked: string
  unlocked: string
  adminView: string
  teacher: string
  student: string
  save: string
  cancel: string
  delete: string
  discard: string
  edit: string
  confirm: string
  search: string
  actions: string
  rank: string
  total: string
  average: string
  grade: string
  remarks: string
  gender: string
  male: string
  female: string
  dob: string
  academicYear: string
  evaluationMonth: string
  homeroomTeacher: string
  className: string
  classAverage: string
  totalStudents: string
  passRate: string
  highestScore: string
  lowestScore: string
  studentCountUnit: string
  lastSaved: string
  noDataFound: string
  page: string

  // Dashboard / Index
  dashboardTitle: string
  dashboardSubtitle: string
  btnEnterGradebook: string
  btnStudentPortal: string
  roleModulesTitle: string
  roleModulesSubtitle: string
  adminModuleTitle: string
  adminModuleDesc: string
  adminModuleAction: string
  adminLockedDesc: string
  teacherModuleTitle: string
  teacherModuleDesc: string
  teacherModuleAction: string
  teacherLockedDesc: string
  studentModuleTitle: string
  studentModuleDesc: string
  studentModuleAction: string
  honorRollTitle: string
  honorRollSubtitle: string
  gradeBreakdownTitle: string
  gradeCountUnit: string

  // Teacher / Gradebook
  gradebookTitle: string
  gradebookSubtitle: string
  saveMarks: string
  marksSavedSuccess: string
  editingLockedNotice: string
  editingLockedNoticeBody: string
  unsavedWarning: string
  unsavedBadge: string
  searchStudentPlaceholder: string
  subjectMath: string
  subjectPhysics: string
  subjectChemistry: string
  subjectBiology: string
  subjectKhmer: string
  subjectEnglish: string
  basedOnStudents: string

  // Student Portal
  studentPortalTitle: string
  studentPortalSubtitle: string
  selectStudent: string
  printReportCard: string
  studentIdLabel: string
  dobLabel: string
  classLabel: string
  passedStatus: string
  failedStatus: string
  topRankBadge: string
  topPercentRank: string
  totalPointsOutOf: string
  percentOfMax: string
  subjectBreakdownTitle: string
  passMarkLabel: string
  performanceExcellent: string
  performanceVeryGood: string
  performanceGood: string
  performanceNeedsImprovement: string
  homeroomRemarksTitle: string
  defaultHomeroomRemarks: string
  homeroomTeacherLabel: string
  reportDateLabel: string
  sealApprovalTitle: string
  schoolPrincipal: string
  sealPlaceholderText: string
  emptyStudentData: string

  // Admin Dashboard
  adminCenterTitle: string
  adminCenterSubtitle: string
  manageRolePasswords: string
  unlockGradebook: string
  lockGradebook: string
  addStudent: string
  activeRolePasswordsTitle: string
  activeRolePasswordsSubtitle: string
  adminPasswordLabel: string
  teacherPasswordLabel: string
  studentPasswordLabel: string
  editClassInfo: string
  resetData: string
  classRosterTitle: string
  classRosterSubtitle: string
  totalStudentsLabel: string
  modalManagePasswordsTitle: string
  modalManagePasswordsSubtitle: string
  adminPassDesc: string
  teacherPassDesc: string
  studentPassDesc: string
  modalAddStudentTitle: string
  studentFullName: string
  initialScoresTitle: string
  modalEditClassTitle: string
  modalDeleteStudentTitle: string
  modalDeleteStudentBody: string
  deleteConfirmBtn: string
  modalResetTitle: string
  modalResetBody: string
  resetConfirmBtn: string
  passwordUpdatedToast: string

  // Auth Pages
  loginTitle: string
  signUpTitle: string
  usernameLabel: string
  usernamePlaceholder: string
  passwordLabel: string
  passwordPlaceholder: string
  confirmPasswordLabel: string
  confirmPasswordPlaceholder: string
  selectClassLabel: string
  alreadyHaveAccount: string
  dontHaveAccount: string
  signingIn: string
  signingUp: string
  passwordsDoNotMatch: string
  enterPasswordError: string

  // Class Management Center
  classesTitle: string
  classesSubtitle: string
  createNewClass: string
  lockAll: string
  unlockAll: string
  activeClassBadge: string
  setActive: string
  viewRoster: string
  roomLabel: string
  topStudentLabel: string
  enrolledStudents: string
  passRateLabel: string
  averageScore: string
  gradeDistribution: string
  deleteClass: string
  deleteClassConfirm: string
  deleteClassWarning: string
  filterAll: string
  filterGrade12: string
  filterGrade11: string
  filterGrade10: string
  searchClassPlaceholder: string
  sortBy: string
  sortName: string
  sortAverage: string
  sortStudents: string
  sortPassRate: string
  activeClassesCount: string
  totalSchoolStudents: string
  schoolAverage: string
  homeroomTeachers: string
  topPerformingClass: string
  addClassModalTitle: string
  editClassModalTitle: string
  classIdLabel: string

  // Student Portal Tabs
  tabMyScorecard: string
  tabClassRoster: string
  tabClassGradebook: string
  tabPrintReport: string
  youBadge: string
  classLeaderboard: string
  classmatesCount: string
}

const translations: Record<Locale, TranslationDict> = {
  en: {
    appTitle: 'Single Class Management',
    appSubtitle: 'Academic Grading & Student Portal',
    overview: 'Overview',
    admin: 'Admin',
    menuClass: 'Classes',
    gradebook: 'Gradebook',
    studentPortal: 'Student Portal',
    login: 'Login',
    logout: 'Sign Out',
    signUp: 'Sign Up',
    signIn: 'Sign In',
    backToHome: 'Back to Home',
    locked: 'Locked',
    unlocked: 'Live',
    adminView: 'Admin',
    teacher: 'Teacher',
    student: 'Student',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    discard: 'Discard',
    edit: 'Edit',
    confirm: 'Confirm',
    search: 'Search',
    actions: 'Actions',
    rank: 'Rank',
    total: 'Total',
    average: 'Average',
    grade: 'Grade',
    remarks: 'Remarks',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    dob: 'DOB',
    academicYear: 'Academic Year',
    evaluationMonth: 'Month',
    homeroomTeacher: 'Teacher',
    className: 'Class',
    classAverage: 'Class Avg',
    totalStudents: 'Total Students',
    passRate: 'Pass Rate',
    highestScore: 'Highest',
    lowestScore: 'Lowest',
    studentCountUnit: 'students',
    lastSaved: 'Saved',
    noDataFound: 'No records found.',
    page: 'Page',

    dashboardTitle: 'Class Overview',
    dashboardSubtitle: 'Monitor class performance and academic standings.',
    btnEnterGradebook: 'Gradebook',
    btnStudentPortal: 'Student Portal',
    roleModulesTitle: 'Portals',
    roleModulesSubtitle: 'Quick access to role-based workspaces.',
    adminModuleTitle: 'Admin',
    adminModuleDesc: 'Manage classes, student rosters, and system security.',
    adminModuleAction: 'Open Admin',
    adminLockedDesc: 'Administrator access only.',
    teacherModuleTitle: 'Gradebook',
    teacherModuleDesc: 'Input subject marks with instant real-time calculations.',
    teacherModuleAction: 'Open Gradebook',
    teacherLockedDesc: 'Teacher & Admin access only.',
    studentModuleTitle: 'Scorecard',
    studentModuleDesc: 'Individual academic report card and standings.',
    studentModuleAction: 'View Scorecard',
    honorRollTitle: 'Honor Roll',
    honorRollSubtitle: 'Top academic performers.',
    gradeBreakdownTitle: 'Grade Distribution',
    gradeCountUnit: 'students',

    gradebookTitle: 'Teacher Gradebook',
    gradebookSubtitle: 'Live grade calculations and mark entries.',
    saveMarks: 'Save Marks',
    marksSavedSuccess: 'Marks saved successfully!',
    editingLockedNotice: 'Gradebook is Locked',
    editingLockedNoticeBody: 'Editing is disabled by administrator.',
    unsavedWarning: 'Unsaved changes pending.',
    unsavedBadge: 'Unsaved',
    searchStudentPlaceholder: 'Search student name or ID...',
    subjectMath: 'Math',
    subjectPhysics: 'Physics',
    subjectChemistry: 'Chemistry',
    subjectBiology: 'Biology',
    subjectKhmer: 'Khmer',
    subjectEnglish: 'English',
    basedOnStudents: '{count} students enrolled',

    studentPortalTitle: 'Student Portal',
    studentPortalSubtitle: 'Academic evaluation and report card.',
    selectStudent: 'Student:',
    printReportCard: 'Print Report (A4)',
    studentIdLabel: 'Student ID',
    dobLabel: 'DOB',
    classLabel: 'Class',
    passedStatus: 'Passed',
    failedStatus: 'Failed',
    topRankBadge: 'Top 1',
    topPercentRank: 'Top {percent}%',
    totalPointsOutOf: 'of 600 pts',
    percentOfMax: '{percent}% of max',
    subjectBreakdownTitle: 'Subject Scores',
    passMarkLabel: 'Pass mark: 50 pts',
    performanceExcellent: 'Excellent',
    performanceVeryGood: 'Very Good',
    performanceGood: 'Passed',
    performanceNeedsImprovement: 'Needs Work',
    homeroomRemarksTitle: 'Teacher Remarks',
    defaultHomeroomRemarks: 'The student displays diligent effort, positive discipline, and steady engagement.',
    homeroomTeacherLabel: 'Teacher',
    reportDateLabel: 'Date',
    sealApprovalTitle: 'Official Approval',
    schoolPrincipal: 'Principal',
    sealPlaceholderText: 'SEAL & SIGNATURE',
    emptyStudentData: 'No student records available.',

    adminCenterTitle: 'Admin Center',
    adminCenterSubtitle: 'Manage rosters, class locks, and security passcodes.',
    manageRolePasswords: 'Role Passwords',
    unlockGradebook: 'Unlock Gradebook',
    lockGradebook: 'Lock Gradebook',
    addStudent: 'Add Student',
    activeRolePasswordsTitle: 'Role Passwords',
    activeRolePasswordsSubtitle: 'Credentials for instant role access.',
    adminPasswordLabel: 'Admin Password',
    teacherPasswordLabel: 'Teacher Password',
    studentPasswordLabel: 'Student Password',
    editClassInfo: 'Edit Class',
    resetData: 'Reset Data',
    classRosterTitle: 'Class Roster',
    classRosterSubtitle: 'Manage student enrollment and marks.',
    totalStudentsLabel: 'Total',
    modalManagePasswordsTitle: 'Role Passwords',
    modalManagePasswordsSubtitle: 'Configure access credentials for each role.',
    adminPassDesc: 'Full administrative access.',
    teacherPassDesc: 'Gradebook and score editing.',
    studentPassDesc: 'Personal scorecard access.',
    modalAddStudentTitle: 'Add Student',
    studentFullName: 'Full Name *',
    initialScoresTitle: 'Initial Scores (0-100)',
    modalEditClassTitle: 'Edit Class Details',
    modalDeleteStudentTitle: 'Delete Student?',
    modalDeleteStudentBody: 'All academic records for student {id} will be removed.',
    deleteConfirmBtn: 'Delete',
    modalResetTitle: 'Reset Data?',
    modalResetBody: 'All local changes will be reset to server defaults.',
    resetConfirmBtn: 'Reset',
    passwordUpdatedToast: 'Role passwords updated!',

    loginTitle: 'Sign In',
    signUpTitle: 'Create Account',
    usernameLabel: 'Username',
    usernamePlaceholder: 'Enter username',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter password',
    confirmPasswordLabel: 'Confirm Password',
    confirmPasswordPlaceholder: 'Re-enter password',
    selectClassLabel: 'Select Class',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    signingIn: 'Signing in...',
    signingUp: 'Creating account...',
    passwordsDoNotMatch: 'Passwords do not match.',
    enterPasswordError: 'Please enter a password.',

    // Class Management Center
    classesTitle: 'Class Management',
    classesSubtitle: 'Overview of all classes, rosters, and live statistics.',
    createNewClass: 'New Class',
    lockAll: 'Lock All',
    unlockAll: 'Unlock All',
    activeClassBadge: 'Active Class',
    setActive: 'Set Active',
    viewRoster: 'View Roster',
    roomLabel: 'Room',
    topStudentLabel: 'Top Student',
    enrolledStudents: 'Enrolled',
    passRateLabel: 'Pass Rate',
    averageScore: 'Average',
    gradeDistribution: 'Grades',
    deleteClass: 'Delete Class',
    deleteClassConfirm: 'Delete this class?',
    deleteClassWarning: 'All students in this class will be removed.',
    filterAll: 'All',
    filterGrade12: 'Grade 12',
    filterGrade11: 'Grade 11',
    filterGrade10: 'Grade 10',
    searchClassPlaceholder: 'Search class, teacher, room...',
    sortBy: 'Sort by',
    sortName: 'Name (A-Z)',
    sortAverage: 'Highest Avg',
    sortStudents: 'Most Students',
    sortPassRate: 'Highest Pass Rate',
    activeClassesCount: 'Classes',
    totalSchoolStudents: 'Total Students',
    schoolAverage: 'School Avg',
    homeroomTeachers: 'Teachers',
    topPerformingClass: 'Top Class',
    addClassModalTitle: 'New Class',
    editClassModalTitle: 'Edit Class',
    classIdLabel: 'Class ID',

    // Student Portal Tabs
    tabMyScorecard: 'Scorecard',
    tabClassRoster: 'Class Standings',
    tabClassGradebook: 'Class Gradebook',
    tabPrintReport: 'Print Report',
    youBadge: 'You',
    classLeaderboard: 'Class Leaderboard',
    classmatesCount: 'Classmates'
  },
  km: {
    appTitle: 'ប្រព័ន្ធគ្រប់គ្រងថ្នាក់រៀន',
    appSubtitle: 'គ្រប់គ្រងពិន្ទុ និងលទ្ធផលសិស្ស',
    overview: 'ទិដ្ឋភាពទូទៅ',
    admin: 'រដ្ឋបាល',
    menuClass: 'ថ្នាក់រៀន',
    gradebook: 'សៀវភៅពិន្ទុ',
    studentPortal: 'លទ្ធផលសិស្ស',
    login: 'ចូលប្រើ',
    logout: 'ចាកចេញ',
    signUp: 'ចុះឈ្មោះ',
    signIn: 'ចូលប្រើ',
    backToHome: 'ទំព័រដើម',
    locked: 'បានចាក់សោ',
    unlocked: 'បើកកែប្រែ',
    adminView: 'រដ្ឋបាល',
    teacher: 'គ្រូបង្រៀន',
    student: 'សិស្ស',
    save: 'រក្សាទុក',
    cancel: 'បោះបង់',
    delete: 'លុប',
    discard: 'ត្រឡប់ដើម',
    edit: 'កែប្រែ',
    confirm: 'យល់ព្រម',
    search: 'ស្វែងរក',
    actions: 'សកម្មភាព',
    rank: 'ចំណាត់ថ្នាក់',
    total: 'សរុប',
    average: 'មធ្យមភាគ',
    grade: 'និទ្ទេស',
    remarks: 'ចំណាំ',
    gender: 'ភេទ',
    male: 'ប្រុស',
    female: 'ស្រី',
    dob: 'ថ្ងៃខែឆ្នាំកំណើត',
    academicYear: 'ឆ្នាំសិក្សា',
    evaluationMonth: 'ខែ',
    homeroomTeacher: 'គ្រូបន្ទុកថ្នាក់',
    className: 'ថ្នាក់',
    classAverage: 'មធ្យមភាគថ្នាក់',
    totalStudents: 'សិស្សសរុប',
    passRate: 'អត្រាជាប់',
    highestScore: 'ពិន្ទុខ្ពស់បំផុត',
    lowestScore: 'ពិន្ទុទាបបំផុត',
    studentCountUnit: 'នាក់',
    lastSaved: 'បាន Save',
    noDataFound: 'មិនមានទិន្នន័យ។',
    page: 'ទំព័រ',

    dashboardTitle: 'ទិដ្ឋភាពទូទៅ',
    dashboardSubtitle: 'តាមដានស្ថានភាពសិក្សា និងលទ្ធផលសិស្សក្នុងថ្នាក់។',
    btnEnterGradebook: 'សៀវភៅពិន្ទុ',
    btnStudentPortal: 'លទ្ធផលសិស្ស',
    roleModulesTitle: 'ច្រកចូលតាមតួនាទី',
    roleModulesSubtitle: 'ចូលទៅកាន់ផ្នែកនីមួយៗតាមសិទ្ធិរបស់អ្នក។',
    adminModuleTitle: 'រដ្ឋបាល',
    adminModuleDesc: 'គ្រប់គ្រងបញ្ជីសិស្ស ព័ត៌មានថ្នាក់ និងសោពិន្ទុ។',
    adminModuleAction: 'ចូល Admin',
    adminLockedDesc: 'សម្រាប់តែគណៈគ្រប់គ្រងប៉ុណ្ណោះ។',
    teacherModuleTitle: 'សៀវភៅពិន្ទុ',
    teacherModuleDesc: 'បញ្ចូលពិន្ទុមុខវិជ្ជា និងគណនាលទ្ធផលស្វ័យប្រវត្តិ។',
    teacherModuleAction: 'ចូលសៀវភៅពិន្ទុ',
    teacherLockedDesc: 'សម្រាប់តែលោកគ្រូ-អ្នកគ្រូប៉ុណ្ណោះ។',
    studentModuleTitle: 'លទ្ធផលសិស្ស',
    studentModuleDesc: 'ពិនិត្យពិន្ទុផ្ទាល់ខ្លួន និងបោះពុម្ពព្រឹត្តិបត្រ A4។',
    studentModuleAction: 'មើលលទ្ធផល',
    honorRollTitle: 'តារាងកិត្តិយស',
    honorRollSubtitle: 'សិស្សឆ្នើមប្រចាំថ្នាក់។',
    gradeBreakdownTitle: 'ការបែងចែកនិទ្ទេស',
    gradeCountUnit: 'នាក់',

    gradebookTitle: 'សៀវភៅពិន្ទុ',
    gradebookSubtitle: 'បញ្ចូល និងគ្រប់គ្រងពិន្ទុសិស្សក្នុងថ្នាក់។',
    saveMarks: 'រក្សាទុកពិន្ទុ',
    marksSavedSuccess: 'បានរក្សាទុកពិន្ទុដោយជោគជ័យ!',
    editingLockedNotice: 'ពិន្ទុត្រូវបានចាក់សោ',
    editingLockedNoticeBody: 'គណៈគ្រប់គ្រងបានបិទការកែប្រែពិន្ទុ។',
    unsavedWarning: 'មានពិន្ទុមិនទាន់ Save។',
    unsavedBadge: 'មិនទាន់ Save',
    searchStudentPlaceholder: 'ស្វែងរកតាមឈ្មោះ ឬ អត្តលេខ...',
    subjectMath: 'គណិត',
    subjectPhysics: 'រូបវិទ្យា',
    subjectChemistry: 'គីមី',
    subjectBiology: 'ជីវវិទ្យា',
    subjectKhmer: 'ភាសាខ្មែរ',
    subjectEnglish: 'អង់គ្លេស',
    basedOnStudents: 'សិស្សសរុប {count} នាក់',

    studentPortalTitle: 'លទ្ធផលសិក្សា',
    studentPortalSubtitle: 'ពិនិត្យពិន្ទុ ចំណាត់ថ្នាក់ និងបោះពុម្ពព្រឹត្តិបត្រ។',
    selectStudent: 'សិស្ស:',
    printReportCard: 'បោះពុម្ព',
    studentIdLabel: 'អត្តលេខ',
    dobLabel: 'ថ្ងៃកំណើត',
    classLabel: 'ថ្នាក់',
    passedStatus: 'ជាប់',
    failedStatus: 'ធ្លាក់',
    topRankBadge: 'លេខ ១',
    topPercentRank: 'លំដាប់កំពូល {percent}%',
    totalPointsOutOf: 'នៃ 600 ពិន្ទុ',
    percentOfMax: '{percent}% នៃពិន្ទុពេញ',
    subjectBreakdownTitle: 'ពិន្ទុតាមមុខវិជ្ជា',
    passMarkLabel: 'ពិន្ទុជាប់: 50',
    performanceExcellent: 'ឆ្នើម',
    performanceVeryGood: 'ល្អណាស់',
    performanceGood: 'ល្អ',
    performanceNeedsImprovement: 'ត្រូវពង្រឹង',
    homeroomRemarksTitle: 'មតិយោបល់គ្រូបន្ទុកថ្នាក់',
    defaultHomeroomRemarks: 'សិស្សមានការយកចិត្តទុកដាក់ និងវិន័យល្អក្នុងការសិក្សា។',
    homeroomTeacherLabel: 'គ្រូបន្ទុកថ្នាក់',
    reportDateLabel: 'កាលបរិច្ឆេទ',
    sealApprovalTitle: 'ហត្ថលេខា និងត្រាផ្លូវការ',
    schoolPrincipal: 'នាយក / នាយិកា',
    sealPlaceholderText: 'ត្រា និងហត្ថលេខា',
    emptyStudentData: 'មិនមានទិន្នន័យសិស្សឡើយ។',

    adminCenterTitle: 'គ្រប់គ្រងរដ្ឋបាល',
    adminCenterSubtitle: 'គ្រប់គ្រងសិស្ស ចាក់សោពិន្ទុ និងលេខសម្ងាត់។',
    manageRolePasswords: 'កំណត់ Password',
    unlockGradebook: 'ដោះសោពិន្ទុ',
    lockGradebook: 'ចាក់សោពិន្ទុ',
    addStudent: 'បន្ថែមសិស្ស',
    activeRolePasswordsTitle: 'លេខសម្ងាត់ Role',
    activeRolePasswordsSubtitle: 'លេខសម្ងាត់សម្រាប់ចូលប្រើតាមតួនាទី។',
    adminPasswordLabel: 'Admin Password',
    teacherPasswordLabel: 'Teacher Password',
    studentPasswordLabel: 'Student Password',
    editClassInfo: 'កែព័ត៌មានថ្នាក់',
    resetData: 'កំណត់ដើម',
    classRosterTitle: 'បញ្ជីឈ្មោះសិស្ស',
    classRosterSubtitle: 'គ្រប់គ្រងព័ត៌មាន និងពិន្ទុសិស្សក្នុងថ្នាក់។',
    totalStudentsLabel: 'សរុប',
    modalManagePasswordsTitle: 'កំណត់លេខសម្ងាត់',
    modalManagePasswordsSubtitle: 'កំណត់ Password សម្រាប់ Admin, Teacher, Student។',
    adminPassDesc: 'សិទ្ធិចូលទំព័រ Admin និងគ្រប់គ្រងទិន្នន័យ។',
    teacherPassDesc: 'សិទ្ធិចូលបញ្ចូល និងកែប្រែពិន្ទុ។',
    studentPassDesc: 'សិទ្ធិមើលលទ្ធផលផ្ទាល់ខ្លួន និងបោះពុម្ព A4។',
    modalAddStudentTitle: 'បន្ថែមសិស្សថ្មី',
    studentFullName: 'គោត្តនាម-នាម *',
    initialScoresTitle: 'ពិន្ទុដំបូង (០-១០០)',
    modalEditClassTitle: 'កែប្រែព័ត៌មានថ្នាក់',
    modalDeleteStudentTitle: 'លុបសិស្សនេះ?',
    modalDeleteStudentBody: 'ទិន្នន័យពិន្ទុទាំងអស់របស់សិស្ស {id} នឹងត្រូវលុប។',
    deleteConfirmBtn: 'លុប',
    modalResetTitle: 'កំណត់ទិន្នន័យឡើងវិញ?',
    modalResetBody: 'ទិន្នន័យទាំងអស់នឹងត្រូវកំណត់មកដូចទិន្នន័យដើម។',
    resetConfirmBtn: 'កំណត់ដើម',
    passwordUpdatedToast: 'បានរក្សាទុកលេខសម្ងាត់!',

    loginTitle: 'ចូលប្រើប្រព័ន្ធ',
    signUpTitle: 'ចុះឈ្មោះគណនីថ្មី',
    usernameLabel: 'ឈ្មោះគណនី',
    usernamePlaceholder: 'បញ្ចូលឈ្មោះគណនី',
    passwordLabel: 'លេខសម្ងាត់',
    passwordPlaceholder: 'បញ្ចូលលេខសម្ងាត់',
    confirmPasswordLabel: 'ផ្ទៀងផ្ទាត់លេខសម្ងាត់',
    confirmPasswordPlaceholder: 'បញ្ចូលលេខសម្ងាត់ម្តងទៀត',
    selectClassLabel: 'ជ្រើសរើសថ្នាក់',
    alreadyHaveAccount: 'មានគណនីរួចហើយ?',
    dontHaveAccount: 'មិនទាន់មានគណនី?',
    signingIn: 'កំពុងចូល...',
    signingUp: 'កំពុងចុះឈ្មោះ...',
    passwordsDoNotMatch: 'លេខសម្ងាត់មិនត្រូវគ្នាទេ។',
    enterPasswordError: 'សូមបញ្ចូលលេខសម្ងាត់។',

    // Class Management Center
    classesTitle: 'គ្រប់គ្រងថ្នាក់រៀន',
    classesSubtitle: 'តាមដាន និងគ្រប់គ្រងថ្នាក់រៀនទាំងអស់ក្នុងសាលា។',
    createNewClass: 'បង្កើតថ្នាក់ថ្មី',
    lockAll: 'ចាក់សោទាំងអស់',
    unlockAll: 'ដោះសោទាំងអស់',
    activeClassBadge: 'ថ្នាក់សកម្ម',
    setActive: 'កំណត់សកម្ម',
    viewRoster: 'មើលបញ្ជីសិស្ស',
    roomLabel: 'បន្ទប់',
    topStudentLabel: 'សិស្សឆ្នើម',
    enrolledStudents: 'សិស្សចុះឈ្មោះ',
    passRateLabel: 'អត្រាជាប់',
    averageScore: 'មធ្យមភាគ',
    gradeDistribution: 'និទ្ទេស',
    deleteClass: 'លុបថ្នាក់',
    deleteClassConfirm: 'លុបថ្នាក់នេះ?',
    deleteClassWarning: 'ទិន្នន័យសិស្សក្នុងថ្នាក់នេះនឹងត្រូវលុបផងដែរ។',
    filterAll: 'ទាំងអស់',
    filterGrade12: 'ថ្នាក់ទី ១២',
    filterGrade11: 'ថ្នាក់ទី ១១',
    filterGrade10: 'ថ្នាក់ទី ១០',
    searchClassPlaceholder: 'ស្វែងរកថ្នាក់ គ្រូ បន្ទប់...',
    sortBy: 'តម្រៀបតាម',
    sortName: 'ឈ្មោះថ្នាក់',
    sortAverage: 'មធ្យមភាគខ្ពស់',
    sortStudents: 'សិស្សច្រើន',
    sortPassRate: 'អត្រាជាប់ខ្ពស់',
    activeClassesCount: 'ថ្នាក់សកម្ម',
    totalSchoolStudents: 'សិស្សសរុប',
    schoolAverage: 'មធ្យមភាគរួម',
    homeroomTeachers: 'គ្រូបន្ទុកថ្នាក់',
    topPerformingClass: 'ថ្នាក់ឆ្នើម',
    addClassModalTitle: 'បង្កើតថ្នាក់ថ្មី',
    editClassModalTitle: 'កែប្រែថ្នាក់',
    classIdLabel: 'អត្តលេខថ្នាក់',

    // Student Portal Tabs
    tabMyScorecard: 'លទ្ធផលផ្ទាល់ខ្លួន',
    tabClassRoster: 'សិស្សក្នុងថ្នាក់',
    tabClassGradebook: 'សៀវភៅពិន្ទុ',
    tabPrintReport: 'ព្រឹត្តិបត្រពិន្ទុ',
    youBadge: 'អ្នក',
    classLeaderboard: 'តារាងចំណាត់ថ្នាក់',
    classmatesCount: 'មិត្តរួមថ្នាក់'
  }
}

const LOCALE_STORAGE_KEY = 'sms_language'

export const useI18n = () => {
  const currentLocale = useState<Locale>('app_locale', () => 'en')
  const isInitialized = useState<boolean>('app_locale_init', () => false)

  const initLocale = () => {
    if (process.client) {
      currentLocale.value = 'en'
      localStorage.setItem(LOCALE_STORAGE_KEY, 'en')
      isInitialized.value = true
    }
  }

  const setLocale = (_locale?: Locale) => {
    currentLocale.value = 'en'
    if (process.client) {
      localStorage.setItem(LOCALE_STORAGE_KEY, 'en')
    }
  }

  const toggleLocale = () => {
    currentLocale.value = 'en'
  }

  const t = (key: keyof TranslationDict, params?: Record<string, string | number>): string => {
    const dict = translations.en
    let str = dict[key] || (key as string)
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      })
    }
    return str
  }

  if (process.client && !isInitialized.value) {
    initLocale()
  }

  return {
    locale: computed(() => 'en'),
    setLocale,
    toggleLocale,
    t,
    isKhmer: computed(() => false),
    isEnglish: computed(() => true)
  }
}
