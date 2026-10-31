import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function TopicChart({ topics, weakest, t, topicKey, liteMode }) {
  const data = topics.filter(item => item.score !== null)
  return <div className="teacher-chart-wrap">
    <ResponsiveContainer width="100%" height={270}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 5 }}>
        <CartesianGrid stroke="rgba(130,154,180,.12)" vertical={false} />
        <XAxis dataKey="topic" tickFormatter={topic => t(`teacher.topicNames.${topicKey(topic)}`)} tick={{ fill: '#8da1b7', fontSize: 10 }} axisLine={{ stroke: 'rgba(130,154,180,.2)' }} tickLine={false} interval={0} />
        <YAxis domain={[0, 100]} tick={{ fill: '#71859b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={value => `${value}%`} />
        <Tooltip formatter={value => [`${Number(value).toFixed(1)}%`, t('teacher.averageScore')]} labelFormatter={topic => t(`teacher.topicNames.${topicKey(topic)}`)} contentStyle={{ background: '#0a1628', border: '1px solid rgba(0,212,255,.24)', borderRadius: 10, color: '#e8f4fd', fontSize: 11 }} cursor={{ fill: 'rgba(0,212,255,.05)' }} />
        <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={58} isAnimationActive={!liteMode}>
          {data.map(item => <Cell key={item.topic} fill={item.topic === weakest?.topic ? '#ff8056' : '#00bfe8'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
}
