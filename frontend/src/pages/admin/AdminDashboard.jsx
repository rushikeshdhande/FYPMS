import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import AddStudent from "../../components/modal/AddStudent";
import AddTeacher from "../../components/modal/AddTeacher";
import { toast } from "react-toastify";

const AdminDashboard = () => {
 return <>
    <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
    <p>Welcome to your dashboard! Here you can manage your courses, view student submissions, and communicate with your students.</p>
    <p>This project is under development by rushikesh.</p>
  </>;
};

export default AdminDashboard;
