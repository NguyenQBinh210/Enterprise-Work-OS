import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { MOCK_PROJECTS } from '@/lib/mock';

export default function ProjectListPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
                    <p className="text-slate-500 mt-1">Manage and track your ongoing projects.</p>
                </div>
                <Link href="/dashboard/projects/new">
                    <Button size="lg" className="shadow-sm shadow-blue-200">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Project
                    </Button>
                </Link>
            </div>

            {/* Filters (Visual Only) */}
            <div className="flex items-center gap-2 pb-4 overflow-x-auto">
                {['All', 'In Progress', 'Planning', 'Completed', 'On Hold'].map((status, i) => (
                    <button
                        key={status}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${i === 0 ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Projects Grid */}
            {MOCK_PROJECTS.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_PROJECTS.map((project) => (
                        <Link
                            key={project.id}
                            href={`/dashboard/projects/${project.id}`}
                            className="group bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-200 p-6 flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md
                      ${project.status === 'Completed' ? 'bg-emerald-500 shadow-emerald-200' :
                                        project.status === 'In Progress' ? 'bg-blue-500 shadow-blue-200' :
                                            project.status === 'Planning' ? 'bg-purple-500 shadow-purple-200' : 'bg-slate-500 shadow-slate-200'}`}
                                >
                                    {project.name.charAt(0)}
                                </div>
                                <div className="flex -space-x-2">
                                    {project.team.slice(0, 3).map((avatar, i) => (
                                        <img key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src={avatar} alt="Team" />
                                    ))}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                                {project.name}
                            </h3>
                            <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-1">
                                {project.description}
                            </p>

                            <div className="border-t border-slate-100 pt-4 mt-auto">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                            ${project.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                                            project.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                                                project.status === 'Planning' ? 'bg-purple-50 text-purple-700' : 'bg-slate-50 text-slate-700'}`}
                                    >
                                        {project.status}
                                    </span>
                                    <span className="text-slate-500 font-medium">{project.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${project.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-500'
                                            }`}
                                        style={{ width: `${project.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No projects found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">Get started by creating your first project to manage tasks and collaborate with your team.</p>
                    <Link href="/dashboard/projects/new">
                        <Button>Create Project</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
