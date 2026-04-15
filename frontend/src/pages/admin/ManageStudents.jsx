import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddStudent from "../../components/modal/AddStudent";

import {
  createStudent,
  deleteStudent,
  updateStudent,
  getAllUsers,
} from "../../store/slices/adminSlice";
import { CheckCircle, Plus, TriangleAlert, Users } from "lucide-react";
import { toggleStudentModel } from "../../store/slices/popupSlice";

const ManageStudents = () => {
  const { users, projects } = useSelector((state) => state.admin);
  const { isCreateStudentModalOpen } = useSelector((state) => state.popup);

  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [showDeleteModel, setShowDeleteModel] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
  });

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  // ✅ Safe users array fix
  const usersArray = useMemo(() => {
    if (Array.isArray(users)) return users;
    if (Array.isArray(users?.users)) return users.users;
    return [];
  }, [users]);

  // ✅ Students mapping
  const students = useMemo(() => {
    const studentUsers = usersArray.filter(
      (u) => u.role?.toLowerCase() === "student",
    );

    return studentUsers.map((student) => {
      const studentProject = (projects || []).find(
        (p) => student._id === p.student?._id,
      );

      return {
        ...student,
        projectTitle: studentProject?.title || null,
        supervisor: studentProject?.supervisor || null,
        projectStatus: studentProject?.status || null,
      };
    });
  }, [usersArray, projects]);

  // ✅ Departments
  const departments = useMemo(() => {
    const set = new Set(students.map((s) => s.department).filter(Boolean));
    return Array.from(set);
  }, [students]);

  // ✅ Filtered students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterDepartment === "all" || student.department === filterDepartment;

    return matchesSearch && matchesFilter;
  });

  // ✅ Handlers
  const handleCloseModel = () => {
    setEditingStudent(null);
    setFormData({
      name: "",
      email: "",
      department: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingStudent) {
      dispatch(updateStudent({ id: editingStudent._id, ...formData }));
    } else {
      dispatch(createStudent(formData));
    }

    handleCloseModel();
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      department: student.department,
    });
  };

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteModel(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      dispatch(deleteStudent(studentToDelete._id));
      setShowDeleteModel(false);
      setStudentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModel(false);
    setStudentToDelete(null);
  };

  return (
    <>
      <div className="space-y-6">
        {/* ✅ Header */}
        <div className="card">
          <div className="card-header flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="card-title">Manage Students</h1>
              <p className="card-subtitle">
                Add, edit, and manage students in account.
              </p>
            </div>

            {/* ✅ Right aligned button */}
            <div className="w-full md:w-auto flex justify-end">
              <button
                onClick={() => dispatch(toggleStudentModel())}
                className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
              >
                <Plus className="w-5 h-5" />
                <span>Add New Student</span>
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-600">Total Students</p>
                <p className="text-lg font-semibold">{students.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-600">Completed Projects</p>
                <p className="text-lg font-semibold">
                  {
                    students.filter((s) => s.projectStatus === "completed")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TriangleAlert className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-600">Unassigned</p>
                <p className="text-lg font-semibold">
                  {students.filter((s) => !s.supervisor).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Modal */}
        {isCreateStudentModalOpen && (
          <AddStudent
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            editingStudent={editingStudent}
          />
        )}
      </div>
    </>
  );
};

export default ManageStudents;
