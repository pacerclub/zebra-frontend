import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-4">
          <Link href="/">
            <Button size="lg">Start New Session</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Active Timer Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono mb-4">00:00:00</div>
            <div className="flex gap-2">
              <Button className="w-full">Start</Button>
              <Button variant="outline" className="w-full">Reset</Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Notes Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Write your thoughts, progress, or TODOs here..."
              className="min-h-[120px]"
            />
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div>
                  <p className="text-sm font-medium">Completed Timer Session</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div>
                  <p className="text-sm font-medium">Added Note</p>
                  <p className="text-xs text-gray-500">3 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <div>
                  <p className="text-sm font-medium">GitHub Commit</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Time</dt>
                <dd className="text-2xl font-semibold">24h 30m</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Sessions</dt>
                <dd className="text-2xl font-semibold">12</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Commits</dt>
                <dd className="text-2xl font-semibold">34</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="text-2xl font-semibold">8</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Projects Card */}
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Zebra Frontend</p>
                  <p className="text-sm text-gray-500">4 sessions this week</p>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">API Integration</p>
                  <p className="text-sm text-gray-500">2 sessions this week</p>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GitHub Activity Card */}
        <Card>
          <CardHeader>
            <CardTitle>GitHub Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">feat: Add timer functionality</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
              <div>
                <p className="text-sm font-medium">fix: Resolve UI bugs</p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
              <div>
                <p className="text-sm font-medium">docs: Update README</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
