import TaskCard from './TaskCard';
import { ListTodo, CheckCircle2 } from 'lucide-react';

const KanbanColumn = ({
  column,
  tasks,
  onMoveTask,
  isAdmin,
  allColumns,
  userData
}) => {

  const getColumnColor = (id) => {
    switch (id) {
      case 'todo': return 'dark:bg-slate-800 light:!bg-blue-600';
      case 'pending': return 'dark:bg-amber-900/40 light:!bg-blue-600';
      case 'done': return 'dark:bg-emerald-900/40 light:!bg-blue-600';
      default: return 'dark:bg-slate-800 light:!bg-blue-600';
    }
  };

  const getColumnIcon = (id) => {
    switch (id) {
      case 'todo': return <ListTodo className="w-5 h-5" />;
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'done': return <CheckCircle2 className="w-5 h-5" />;
      default: return <ListTodo className="w-5 h-5" />;
    }
  };

  const getColumnTextColor = (id) => {
    switch (id) {
      case 'todo': return 'dark:text-slate-300 light:text-white';
      case 'pending': return 'dark:text-amber-400 light:text-white';
      case 'done': return 'dark:text-emerald-400 light:text-white';
      default: return 'dark:text-slate-300 light:text-white';
    }
  };

  return (
    <div className="flex-1">
      <div className={`${getColumnColor(column.id)} rounded-t-xl p-3 md:p-4 border-b dark:border-dark-border light:border-gray-200 light:shadow-lg dark:shadow-lg`}>
        <div className="flex items-center justify-between">
          <h2 className={`font-display font-semibold text-base md:text-lg flex items-center gap-2 ${getColumnTextColor(column.id)}`}>
            {getColumnIcon(column.id)}
            <span className="uppercase tracking-wide">{column.title}</span>
          </h2>
          <span className="dark:bg-dark-bg-primary light:!bg-blue-600 dark:text-dark-text-secondary light:text-white font-semibold text-xs px-2.5 py-1 rounded-md dark:border-dark-border light:border-blue-500 border">
            {tasks.length}
          </span>
        </div>
      </div>

      <div
        className="glass-card rounded-b-xl p-3 md:p-4 min-h-[300px] md:min-h-[400px] max-h-[calc(100vh-320px)] overflow-y-auto shadow-inner"
      >
        {tasks.length === 0 ? (
          <div className="text-center dark:text-dark-text-muted light:text-light-text-muted py-12">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tasks here</p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onMoveTask={onMoveTask}
              isAdmin={isAdmin}
              currentColumn={column.id}
              allColumns={allColumns}
              userData={userData}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
