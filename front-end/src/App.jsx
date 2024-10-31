import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import PropTypes from "prop-types";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDownIcon } from "lucide-react";

export default function App() {
  const STATUS_PROGRESS = {
    applied: 10,
    "oa sent": 40,
    "oa received": 25,
    interviewed: 60,
    offered: 85,
    accepted: 100,
    rejected: 0,
  };

  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [newApplication, setNewApplication] = useState({
    company: "",
    position: "",
    status: "applied",
    progress: STATUS_PROGRESS["applied"],
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/applications", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching applications:", err);
    }
  };
  const handleInputChange = (e) => {
    setNewApplication({ ...newApplication, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (value) => {
    setNewApplication({
      ...newApplication,
      status: value,
      progress: STATUS_PROGRESS[value],
    });
  };


  

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/applications/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus, progress: STATUS_PROGRESS[newStatus] }),
        }
      );

        const responseData = await response.json();
        console.log("Response status:", response.body);


      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update application status");
      }

      console.log("Status updated successfully", responseData);

      await fetchApplications();
    } catch (e) {
      setError(e.message);
      console.error("Error updating application status:", e);
    }
  };

  const StatusDropdownCell = ({ application, onStatusUpdate }) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center justify-center">
          <span className="capitalize">{application.status}</span>
          <ChevronDownIcon className="w-4 h-4 ml-2" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {Object.keys(STATUS_PROGRESS).map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() => onStatusUpdate(application.id, status)}
              className="capitalize"
            >
              {status} ({STATUS_PROGRESS[status.toLowerCase()]}%)
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  StatusDropdownCell.propTypes = {
    application: PropTypes.shape({
      id: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
    }).isRequired,
    onStatusUpdate: PropTypes.func.isRequired,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting application:", newApplication);

    try {
      const applicationData = {
        company: newApplication.company,
        position: newApplication.position,
        status: newApplication.status.toLowerCase(),
        progress: STATUS_PROGRESS[newApplication.status.toLowerCase()],
      };

      console.log("Sending data:", applicationData); // Debug log

      const response = await fetch(`http://localhost:5001/api/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create application");
      }

      const data = await response.json();
      console.log("Success:", data);

      setNewApplication({
        company: "",
        position: "",
        status: "applied",
        progress: STATUS_PROGRESS["applied"],
      });
      await fetchApplications();
    } catch (err) {
      setError(err.message);
      console.error("Error creating application:", err);
    }
  };
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/applications/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      console.log("Delete item: ", response);
      if (!response.ok) {
        throw new Error("Failed to delete application");
      }

      await fetchApplications();
    } catch (err) {
      setError(err.message);
      console.error("Error deleting application:", err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Add New Job Application</h1>
      <p className="mb-4">Enter the details of your new job application</p>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <Input
          name="company"
          value={newApplication.company}
          onChange={handleInputChange}
          placeholder="Company"
          required
        />
        <Input
          name="position"
          value={newApplication.position}
          onChange={handleInputChange}
          placeholder="Position"
          required
        />
        <Select
          onValueChange={handleStatusChange}
          defaultValue={newApplication.status}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="applied">Applied (10%)</SelectItem>
            <SelectItem value="oa sent">OA Sent (40%)</SelectItem>
            <SelectItem value="oa received">OA Received (25%)</SelectItem>
            <SelectItem value="interviewed">Interviewed (60%)</SelectItem>
            <SelectItem value="offered">Offered (85%)</SelectItem>
            <SelectItem value="accepted">Accepted (100%)</SelectItem>
            <SelectItem value="rejected">Rejected (0%)</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit">Add Application</Button>
      </form>

      <h2 className="text-2xl font-bold mb-4">Job Applications</h2>
      <p className="mb-4">Track your job application progress</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell>{app.company}</TableCell>
              <TableCell>{app.position}</TableCell>
              <TableCell>
                <StatusDropdownCell
                  application={app}
                  onStatusUpdate={handleStatusUpdate}
                ></StatusDropdownCell>
              </TableCell>
              <TableCell>{app.progress}%</TableCell>
              <TableCell>
                <Button
                  onClick={() => handleDelete(app.id)}
                  variant="destructive"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
