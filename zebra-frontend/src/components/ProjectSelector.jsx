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
  const { projects, currentProjectId, addProject, setCurrentProject } = useStore();

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      addProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreating(false);
    }
  };

  if (isCreating) {
    return (
      <div className="flex gap-2">
        <Input
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="Project name"
          className="max-w-[200px]"
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
