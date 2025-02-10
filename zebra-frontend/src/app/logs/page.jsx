import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WorkLogs() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Work Logs</h1>
        <div className="flex gap-4">
          <Button variant="outline">Filter</Button>
          <Button variant="outline">Export</Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Today's Logs */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Today</h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">Frontend Development</h3>
                    <p className="text-sm text-gray-500 mt-1">10:00 AM - 12:30 PM (2h 30m)</p>
                  </div>
                  <Button variant="ghost">View Details</Button>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Implemented new timer functionality and fixed UI responsiveness issues.
                    Added proper error handling for API calls.
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    React
                  </span>
                  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
                    API Integration
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">Documentation Update</h3>
                    <p className="text-sm text-gray-500 mt-1">2:00 PM - 3:15 PM (1h 15m)</p>
                  </div>
                  <Button variant="ghost">View Details</Button>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Updated API documentation with new endpoints. Added examples and improved clarity.
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                    Documentation
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Yesterday's Logs */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Yesterday</h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">Bug Fixes</h3>
                    <p className="text-sm text-gray-500 mt-1">3:00 PM - 5:30 PM (2h 30m)</p>
                  </div>
                  <Button variant="ghost">View Details</Button>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Fixed several critical bugs in the authentication system.
                    Improved error handling and user feedback.
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-700/10">
                    Bug Fix
                  </span>
                  <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-700/10">
                    Authentication
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Statistics Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Hours</dt>
                <dd className="text-2xl font-semibold">32h 15m</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Sessions</dt>
                <dd className="text-2xl font-semibold">15</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Projects</dt>
                <dd className="text-2xl font-semibold">3</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
