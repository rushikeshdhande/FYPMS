import { useSelector } from "react-redux";

const StudentDashboard = () => {

  const { authUser } = useSelector((state) => state.auth);

 return <>
    <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
    <p>Welcome to your dashboard! Here you can manage your courses, view student submissions, and communicate with your students.</p>
    <p>This project is under development by rushikesh.</p>
  </>;
};

export default StudentDashboard;