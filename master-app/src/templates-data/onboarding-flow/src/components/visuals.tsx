import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Alert,
  Avatar,
  Card,
  Chip,
  Progress,
  Separator,
  Switch,
  Text,
} from 'glacia-native';
import { useBackdrop } from '../state';
import { Figure, useAccent } from '../ui';

/**
 * The big glass visual at the top of each intro screen. Every visual is a
 * composition of real Glacia components — the same cards, progress bars,
 * avatars and alerts the buyer gets from the package — never a picture
 * of a UI. A couple of them are live: the focus switch, the alert filter
 * chips and the security toggles all work. Figures are mono and tabular;
 * status is quiet text, never a badge.
 */

function Row({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

/* ---------------- Screen 1 — analytics ---------------- */

const METRICS: Array<{ label: string; value: number; display: string }> = [
  { label: 'Deep work', value: 84, display: '16.8h' },
  { label: 'Design reviews', value: 62, display: '6.2h' },
  { label: 'Customer calls', value: 45, display: '4.5h' },
];

export function AnalyticsVisual() {
  const { darkMode } = useBackdrop();
  const accent = useAccent();
  return (
    <Card isDark={darkMode} padding={20} style={styles.card}>
      <Row>
        <Text isDark={darkMode} variant="heading">
          Focus this week
        </Text>
        <Figure variant="label" style={{ color: accent }}>
          +18%
        </Figure>
      </Row>
      <View style={styles.bigStat}>
        <Figure variant="title">31.5h</Figure>
        <Text isDark={darkMode} variant="caption" muted>
          of deep work — up 4.2h on last week
        </Text>
      </View>
      <View style={styles.stack}>
        {METRICS.map((metric) => (
          <View key={metric.label} style={styles.metric}>
            <Row>
              <Text isDark={darkMode} variant="label">
                {metric.label}
              </Text>
              <Figure variant="caption" muted>
                {metric.display}
              </Figure>
            </Row>
            <Progress
              isDark={darkMode}
              value={metric.value}
              tint={accent}
              accessibilityLabel={`${metric.label}: ${metric.value} percent of the week`}
            />
          </View>
        ))}
      </View>
      <Separator isDark={darkMode} style={styles.separator} />
      <Text isDark={darkMode} variant="caption" muted>
        Built automatically from Calendar, Docs and Slack.
      </Text>
    </Card>
  );
}

/* ---------------- Screen 2 — team availability ---------------- */

const TEAM: Array<{ name: string; note: string; inFocus: boolean; status: 'online' | 'busy' | 'offline'; image: number }> = [
  { name: 'Sarah Chen', note: 'Product designer · free until 15:00', inFocus: true, status: 'online', image: require('../../assets/img/person-sarah-chen.jpg') },
  { name: 'Alex Rivera', note: 'Engineer · in a design review', inFocus: false, status: 'busy', image: require('../../assets/img/person-alex-rivera.jpg') },
  { name: 'Elena Rostova', note: 'Data lead · reviewing the Q3 model', inFocus: true, status: 'online', image: require('../../assets/img/person-elena-rostova.jpg') },
];

export function TeamVisual() {
  const { darkMode } = useBackdrop();
  const accent = useAccent();
  const [shareFocus, setShareFocus] = useState(true);
  return (
    <Card isDark={darkMode} padding={20} style={styles.card}>
      <Row>
        <Text isDark={darkMode} variant="heading">
          Your team is in flow
        </Text>
        <View style={styles.avatarStack}>
          {TEAM.map((person, i) => (
            <Avatar
              key={person.name}
              isDark={darkMode}
              name={person.name}
              size="sm"
              source={person.image}
              style={i > 0 ? styles.avatarOverlap : undefined}
            />
          ))}
        </View>
      </Row>
      <View style={styles.stack}>
        {TEAM.map((person) => (
          <Row key={person.name} style={styles.personRow}>
            <Avatar isDark={darkMode} name={person.name} size="md" status={person.status} source={person.image} />
            <View style={styles.personText}>
              <Text isDark={darkMode} variant="label">
                {person.name}
              </Text>
              <Text isDark={darkMode} variant="caption" muted numberOfLines={1}>
                {person.note}
              </Text>
            </View>
            <Figure
              variant="caption"
              muted={!person.inFocus}
              numberOfLines={1}
              style={person.inFocus ? { color: accent } : undefined}
            >
              {person.inFocus ? 'In focus' : 'Busy'}
            </Figure>
          </Row>
        ))}
      </View>
      <Separator isDark={darkMode} style={styles.separator} />
      <Row>
        <View style={styles.personText}>
          <Text isDark={darkMode} variant="label">
            Share my focus status
          </Text>
          <Text isDark={darkMode} variant="caption" muted>
            {shareFocus ? 'Teammates can see when not to interrupt' : 'Your status is hidden'}
          </Text>
        </View>
        <Switch
          isDark={darkMode}
          value={shareFocus}
          onValueChange={setShareFocus}
          accessibilityLabel="Share my focus status"
        />
      </Row>
    </Card>
  );
}

/* ---------------- Screen 3 — notifications ---------------- */

type AlertItem = {
  id: string;
  category: 'mentions' | 'shipped';
  tone: 'info' | 'success' | 'warning';
  title: string;
  description: string;
};

const ALERTS: AlertItem[] = [
  {
    id: 'standup',
    category: 'mentions',
    tone: 'info',
    title: 'Sarah mentioned you',
    description: '“Can you look at the onboarding numbers before standup?”',
  },
  {
    id: 'deploy',
    category: 'shipped',
    tone: 'success',
    title: 'Checkout v2.4 shipped',
    description: 'Deployed to production 12 minutes ago. No errors so far.',
  },
  {
    id: 'review',
    category: 'mentions',
    tone: 'warning',
    title: 'A review is waiting',
    description: 'Pricing experiment results are ready for your sign-off at 15:00.',
  },
];

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'mentions', label: 'Mentions' },
  { id: 'shipped', label: 'Shipped' },
] as const;

export function AlertsVisual() {
  const { darkMode } = useBackdrop();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const [dismissed, setDismissed] = useState<string[]>([]);
  const visible = ALERTS.filter(
    (alert) => (filter === 'all' || alert.category === filter) && !dismissed.includes(alert.id),
  );
  return (
    <View style={styles.alertStack}>
      <View style={styles.chipRow}>
        {FILTERS.map((item) => (
          <Chip
            isDark={darkMode}
            key={item.id}
            label={item.label}
            selected={filter === item.id}
            onSelectedChange={(selected) => {
              if (selected) setFilter(item.id);
            }}
          />
        ))}
      </View>
      {visible.map((alert) => (
        <Alert
          isDark={darkMode}
          key={alert.id}
          tone={alert.tone}
          title={alert.title}
          description={alert.description}
          onDismiss={() => setDismissed((prev) => [...prev, alert.id])}
        />
      ))}
      {visible.length === 0 ? (
        <Alert
          isDark={darkMode}
          tone="success"
          title="All caught up"
          description="Nothing needs you right now."
        />
      ) : null}
    </View>
  );
}

/* ---------------- Screen 4 — security ---------------- */

export function SecurityVisual() {
  const { darkMode } = useBackdrop();
  const accent = useAccent();
  const [faceId, setFaceId] = useState(true);
  const [hardwareKey, setHardwareKey] = useState(false);
  const score = 84 + (faceId ? 4 : 0) + (hardwareKey ? 8 : 0);
  return (
    <Card isDark={darkMode} padding={20} style={styles.card}>
      <Row>
        <Text isDark={darkMode} variant="heading">
          Protected by default
        </Text>
      </Row>
      <View style={styles.stack}>
        <Row>
          <View style={styles.personText}>
            <Text isDark={darkMode} variant="label">
              Face ID unlock
            </Text>
            <Text isDark={darkMode} variant="caption" muted>
              Sign in with biometrics on this device
            </Text>
          </View>
          <Switch
            isDark={darkMode}
            value={faceId}
            onValueChange={setFaceId}
            accessibilityLabel="Face ID unlock"
          />
        </Row>
        <Row>
          <View style={styles.personText}>
            <Text isDark={darkMode} variant="label">
              Hardware security key
            </Text>
            <Text isDark={darkMode} variant="caption" muted>
              Require a physical key for admin actions
            </Text>
          </View>
          <Switch
            isDark={darkMode}
            value={hardwareKey}
            onValueChange={setHardwareKey}
            accessibilityLabel="Hardware security key"
          />
        </Row>
      </View>
      <Separator isDark={darkMode} style={styles.separator} />
      <View style={styles.metric}>
        <Row>
          <Text isDark={darkMode} variant="label">
            Security readiness
          </Text>
          <Figure variant="caption">{score}/100</Figure>
        </Row>
        <Progress
          isDark={darkMode}
          value={score}
          tint={accent}
          accessibilityLabel={`Security readiness: ${score} percent`}
        />
      </View>
      <Text isDark={darkMode} variant="caption" muted style={styles.footnote}>
        SSO, SCIM provisioning and audit logs included.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  stack: {
    marginTop: 16,
    gap: 16,
  },
  bigStat: {
    marginTop: 16,
    gap: 4,
  },
  metric: {
    gap: 8,
  },
  separator: {
    marginVertical: 16,
  },
  footnote: {
    marginTop: 12,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarOverlap: {
    marginLeft: -10,
  },
  personRow: {
    justifyContent: 'flex-start',
  },
  personText: {
    flex: 1,
    gap: 1,
  },
  alertStack: {
    width: '100%',
    gap: 12,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
});
