import { useState } from 'react';
import useStore from '@/lib/store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProjectSelector() {
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { 
    projects, 
    currentProject, 
    addProject, 
    setCurrentProject,
    getCurrentProject 
  } = useStore();

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      addProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreating(false);
    }
  };

  // Create initial project if none exists
  if (projects.length === 0 && !isCreating) {
    return (
      <div className="text-center">
        <p className="text-gray-500 mb-4">Create your first project to get started</p>
        <Button onClick={() => setIsCreating(true)}>Create Project</Button>
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="flex gap-2">
        <Input
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="Project name"
          className="max-w-[200px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCreateProject();
            }
          }}
        />
        <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
          Create
        </Button>
        <Button variant="ghost" onClick={() => setIsCreating(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  const currentProjectId = currentProject?.id || getCurrentProject()?.id;

  return (
    <div className="flex gap-2 items-center">
      <Select
        value={currentProjectId || ''}
        onValueChange={setCurrentProject}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map(project => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={() => setIsCreating(true)}>
        New Project
      </Button>
    </div>
  );
}
