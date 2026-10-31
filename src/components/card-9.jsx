import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const Card9 = ({ title, children, className = '' }) => {
  return (
    <Card className={`wm-outline-card gap-0 rounded-none border-cyan-400/50 bg-transparent shadow-2xl ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-cyan-300">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-slate-300 text-sm leading-6">
        {children}
      </CardContent>
    </Card>
  );
};

export default Card9;
