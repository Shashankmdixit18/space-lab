import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const Table6 = ({ columns, rows = [], emptyMessage = 'No class data to show yet.' }) => {
  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-xl border shadow-xs">
        <Table className="teacher-data-table">
          <TableHeader className="bg-muted/50 shadow-[inset_0px_1px_2px_0px_rgba(255,255,255,0.05),inset_0px_-1px_2px_0px_rgba(0,0,0,0.02)]">
            <TableRow>
              {columns.map(column => <TableHead key={column}>{column}</TableHead>)}
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.length ? rows.map((row, rowIndex) => (
              <TableRow key={row.id ?? rowIndex}>{row.cells.map((cell, cellIndex) => <TableCell className={cellIndex === 0 ? 'font-medium' : ''} key={`${row.id ?? rowIndex}-${cellIndex}`}>{cell}</TableCell>)}</TableRow>
            )) : <TableRow><TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground">{emptyMessage}</TableCell></TableRow>}
          </TableBody>

          <TableFooter className="shadow-[inset_0px_1px_2px_0px_rgba(255,255,255,0.06),inset_0px_-1px_2px_0px_rgba(0,0,0,0.02)]">
            <TableRow>
              <TableCell colSpan={columns.length}>{rows.length ? `${rows.length} records` : 'Class roster preview'}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

    </div>
  );
};

export default Table6;
