'use client';

import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Flex,
  Progress,
  Row,
  Statistic,
  Tag,
  Timeline,
  Typography,
  Alert,
  Divider,
  Space,
} from 'antd';
import {
  FireOutlined,
  TrophyOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  BellOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const completedDays = [true, true, true, true, false, false, false];

const recentActivity = [
  { day: 'Today',     label: 'Missed',    color: 'error'   },
  { day: 'Yesterday', label: 'Completed', color: 'success' },
  { day: 'Tuesday',   label: 'Completed', color: 'success' },
  { day: 'Monday',    label: 'Completed', color: 'success' },
  { day: 'Sunday',    label: 'Completed', color: 'success' },
];

const streaks = [
  { name: 'Morning Run',  current: 42, longest: 67, pct: 63, status: 'active'  },
  { name: 'Read 30 min',  current: 18, longest: 30, pct: 60, status: 'active'  },
  { name: 'Meditate',     current:  0, longest: 14, pct:  0, status: 'broken'  },
  { name: 'No sugar',     current:  7, longest:  7, pct: 100, status: 'perfect' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-page)' }}>
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid var(--color-border-subtle)',
          background: 'var(--color-bg-sunken)',
          padding: '0 32px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Flex align="center" gap={10}>
          <FireOutlined style={{ color: '#1DB954', fontSize: 22 }} />
          <Title level={4} style={{ margin: 0, color: '#fff' }}>
            Streak Counter
          </Title>
        </Flex>
        <Flex align="center" gap={12}>
          <Button type="text" icon={<BellOutlined />} />
          <Button type="text" icon={<SettingOutlined />} />
          <Avatar style={{ background: '#1DB954', color: '#111' }}>JR</Avatar>
        </Flex>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px' }}>

        {/* Alert */}
        <Alert
          message="You missed today's Morning Run — don't break the chain tomorrow!"
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 32 }}
        />

        {/* Top stats */}
        <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
          {[
            { title: 'Current Streak',  value: 42,  suffix: 'days',  icon: <FireOutlined />,     color: '#1DB954' },
            { title: 'Longest Streak',  value: 67,  suffix: 'days',  icon: <TrophyOutlined />,   color: '#F29E0D' },
            { title: 'Total Completed', value: 312, suffix: 'days',  icon: <CheckCircleOutlined />, color: '#3D84F5' },
            { title: 'Active Habits',   value: 4,   suffix: 'habits', icon: <CalendarOutlined />,  color: '#20974C' },
          ].map((stat) => (
            <Col xs={24} sm={12} lg={6} key={stat.title}>
              <Card
                bordered={false}
                style={{ background: 'var(--color-bg-surface)' }}
              >
                <Flex align="center" gap={16}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: `${stat.color}22`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      color: stat.color,
                      flexShrink: 0,
                    }}
                  >
                    {stat.icon}
                  </div>
                  <Statistic
                    title={<Text type="secondary" style={{ fontSize: 13 }}>{stat.title}</Text>}
                    value={stat.value}
                    suffix={<Text type="secondary" style={{ fontSize: 13 }}>{stat.suffix}</Text>}
                    valueStyle={{ color: '#fff', fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}
                  />
                </Flex>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[20, 20]}>
          {/* This week */}
          <Col xs={24} lg={14}>
            <Card
              title={<Text strong style={{ color: '#fff' }}>This Week</Text>}
              extra={<Text type="secondary" style={{ fontSize: 13 }}>4 / 7 days</Text>}
              bordered={false}
              style={{ background: 'var(--color-bg-surface)', marginBottom: 20 }}
            >
              <Flex justify="space-between" style={{ marginBottom: 24 }}>
                {weekDays.map((day, i) => (
                  <Flex key={day} vertical align="center" gap={8}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{day}</Text>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: completedDays[i] ? '#1DB954' : 'var(--color-bg-elevated)',
                        color: completedDays[i] ? '#111' : '#555',
                        fontSize: 18,
                        fontWeight: 700,
                      }}
                    >
                      {completedDays[i] ? '✓' : '·'}
                    </div>
                  </Flex>
                ))}
              </Flex>
              <Progress
                percent={57}
                strokeColor="#1DB954"
                trailColor="var(--color-bg-elevated)"
                showInfo={false}
                strokeWidth={8}
                style={{ marginBottom: 4 }}
              />
              <Flex justify="space-between">
                <Text type="secondary" style={{ fontSize: 12 }}>Weekly progress</Text>
                <Text style={{ fontSize: 12, color: '#1DB954' }}>57%</Text>
              </Flex>
            </Card>

            {/* Habit list */}
            <Card
              title={<Text strong style={{ color: '#fff' }}>My Habits</Text>}
              extra={
                <Button type="primary" size="small" icon={<PlusOutlined />}>
                  Add
                </Button>
              }
              bordered={false}
              style={{ background: 'var(--color-bg-surface)' }}
            >
              <Flex vertical gap={20}>
                {streaks.map((habit) => (
                  <div key={habit.name}>
                    <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                      <Flex align="center" gap={10}>
                        <Text style={{ color: '#fff', fontWeight: 500 }}>{habit.name}</Text>
                        <Tag
                          color={
                            habit.status === 'perfect' ? 'green' :
                            habit.status === 'broken'  ? 'red'   : 'default'
                          }
                          style={{ fontSize: 11, lineHeight: '18px', padding: '0 6px' }}
                        >
                          {habit.status}
                        </Tag>
                      </Flex>
                      <Flex align="center" gap={16}>
                        <Flex align="center" gap={4}>
                          <FireOutlined style={{ color: '#1DB954', fontSize: 13 }} />
                          <Text style={{ color: '#1DB954', fontSize: 13, fontWeight: 600 }}>
                            {habit.current}d
                          </Text>
                        </Flex>
                        <Flex align="center" gap={4}>
                          <TrophyOutlined style={{ color: '#F29E0D', fontSize: 13 }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {habit.longest}d
                          </Text>
                        </Flex>
                      </Flex>
                    </Flex>
                    <Progress
                      percent={habit.pct}
                      strokeColor={habit.status === 'broken' ? '#EF4343' : '#1DB954'}
                      trailColor="var(--color-bg-elevated)"
                      showInfo={false}
                      strokeWidth={6}
                    />
                  </div>
                ))}
              </Flex>
            </Card>
          </Col>

          {/* Right column */}
          <Col xs={24} lg={10}>
            {/* Recent activity */}
            <Card
              title={<Text strong style={{ color: '#fff' }}>Recent Activity</Text>}
              bordered={false}
              style={{ background: 'var(--color-bg-surface)', marginBottom: 20 }}
            >
              <Timeline
                items={recentActivity.map((a) => ({
                  dot:
                    a.color === 'success' ? (
                      <CheckCircleOutlined style={{ color: '#1DB954' }} />
                    ) : (
                      <ClockCircleOutlined style={{ color: '#EF4343' }} />
                    ),
                  children: (
                    <Flex justify="space-between">
                      <Text style={{ color: '#B3B3B3' }}>{a.day}</Text>
                      <Badge
                        status={a.color === 'success' ? 'success' : 'error'}
                        text={
                          <Text type={a.color === 'success' ? undefined : 'danger'} style={{ fontSize: 12 }}>
                            {a.label}
                          </Text>
                        }
                      />
                    </Flex>
                  ),
                }))}
              />
            </Card>

            {/* Component preview */}
            <Card
              title={<Text strong style={{ color: '#fff' }}>Component Palette</Text>}
              bordered={false}
              style={{ background: 'var(--color-bg-surface)' }}
            >
              <Flex vertical gap={16}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                    Buttons
                  </Text>
                  <Space wrap>
                    <Button type="primary">Primary</Button>
                    <Button>Default</Button>
                    <Button type="dashed">Dashed</Button>
                    <Button type="text">Text</Button>
                    <Button danger>Danger</Button>
                  </Space>
                </div>

                <Divider style={{ margin: '4px 0', borderColor: 'var(--color-border-subtle)' }} />

                <div>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                    Tags
                  </Text>
                  <Space wrap>
                    <Tag color="green">Active</Tag>
                    <Tag color="red">Broken</Tag>
                    <Tag color="gold">Warning</Tag>
                    <Tag color="blue">Info</Tag>
                    <Tag>Default</Tag>
                  </Space>
                </div>

                <Divider style={{ margin: '4px 0', borderColor: 'var(--color-border-subtle)' }} />

                <div>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                    Alerts
                  </Text>
                  <Flex vertical gap={8}>
                    <Alert message="Keep it up!" type="success" showIcon />
                    <Alert message="Don't forget today." type="info" showIcon />
                    <Alert message="Streak at risk." type="warning" showIcon />
                    <Alert message="Streak broken." type="error" showIcon />
                  </Flex>
                </div>
              </Flex>
            </Card>
          </Col>
        </Row>

        {/* Typography showcase */}
        <Card
          bordered={false}
          style={{ background: 'var(--color-bg-surface)', marginTop: 20 }}
        >
          <Title level={2}>Typography Scale</Title>
          <Title level={3}>Heading 3 — Stay consistent</Title>
          <Title level={4}>Heading 4 — Every day counts</Title>
          <Paragraph>
            Body text in <Text strong>Inter</Text>. Streaks are built one day at a time —
            consistency beats intensity.{' '}
            <Text type="success">Keep going.</Text>{' '}
            <Text type="warning">Don&apos;t skip.</Text>{' '}
            <Text type="danger">Recover fast.</Text>{' '}
            <Text type="secondary">Small steps, big results.</Text>
          </Paragraph>
          <Text code>antd@6 · next@16 · react@19</Text>
        </Card>
      </main>
    </div>
  );
}
