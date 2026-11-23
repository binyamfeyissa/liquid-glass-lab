import React, { useState, type ComponentType, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import {
  Accordion,
  ActionSheet,
  Alert,
  AlertDialog,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Chip,
  Collapsible,
  ContextMenu,
  Dialog,
  DialogTrigger,
  DropdownMenu,
  Field,
  Glass,
  GlassBackdrop,
  GlassContainer,
  GlassProvider,
  GlassStack,
  GlassView,
  Group,
  IconButton,
  Input,
  Label,
  MorphGroup,
  Popover,
  Progress,
  RadioGroup,
  Scrim,
  SegmentedControl,
  Select,
  Separator,
  Sheet,
  Skeleton,
  Slider,
  Stepper,
  Switch,
  TabBar,
  Tabs,
  Text,
  Textarea,
  Toast,
  Toggle,
  ToggleGroup,
  Toolbar,
  Tooltip,
} from "glacia-native";

import { useBackdropMode } from "./theme";

/**
 * One demo per catalogue entry, adapted from the docs' native-demos.tsx to
 * run in the real app: every control is wired to local state, and overlays
 * open from trigger buttons. `isDark` comes from the backdrop mode and is
 * threaded into every component, the way the templates theme by hand.
 */

function Row({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const SHIPPING_OPTIONS = [
  { value: "a", label: "Standard" },
  { value: "b", label: "Express" },
];

/* ------------------------------------------------------------------ */

function AccordionDemo() {
  const { isDark } = useBackdropMode();
  return (
    <Accordion
      isDark={isDark}
      defaultOpenSections={["product"]}
      sections={[
        {
          value: "product",
          title: "Product Information",
          content: (
            <Text isDark={isDark}>
              Our flagship product combines cutting-edge technology with a
              sleek design. Built with premium materials, it offers
              unparalleled performance and reliability.
            </Text>
          ),
        },
        {
          value: "shipping",
          title: "Shipping Details",
          content: (
            <Text isDark={isDark}>Ships in 2 days, worldwide.</Text>
          ),
        },
        {
          value: "returns",
          title: "Return Policy",
          content: <Text isDark={isDark}>30-day returns, no questions.</Text>},
        ]}
    />
  );
}

function ActionSheetDemo() {
  const { isDark } = useBackdropMode();
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState("Nothing picked yet");
  const pick = (label: string) => () => {
    setLast(label);
    setOpen(false);
  };
  return (
    <View>
      <Button
        isDark={isDark}
        accessibilityLabel="Open action sheet"
        onPress={() => setOpen(true)}
      >
        Photo options
      </Button>
      <Text isDark={isDark} variant="caption" muted style={styles.note}>
        {last}
      </Text>
      <ActionSheet
        isDark={isDark}
        open={open}
        onOpenChange={setOpen}
        title="Photo"
        options={[
          { label: "Take photo", onPress: pick("Take photo") },
          { label: "Choose from library", onPress: pick("Choose from library") },
          { label: "Delete photo", destructive: true, onPress: pick("Delete photo") },
        ]}
      />
    </View>
  );
}

function AlertDemo() {
  const { isDark } = useBackdropMode();
  const [showExtra, setShowExtra] = useState(true);
  return (
    <View style={styles.stack}>
      <Alert
        isDark={isDark}
        tone="warning"
        title="Storage almost full"
        description="You have 200 MB left."
      />
      <Alert
        isDark={isDark}
        tone="success"
        title="Backup complete"
        description="Everything is up to date."
      />
      {showExtra ? (
        <Alert
          isDark={isDark}
          tone="info"
          title="Tip"
          description="Tap the × to dismiss this alert."
          onDismiss={() => setShowExtra(false)}
        />
      ) : null}
    </View>
  );
}

function AlertDialogDemo() {
  const { isDark } = useBackdropMode();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState("No decision yet");
  return (
    <View>
      <Button
        isDark={isDark}
        accessibilityLabel="Open alert dialog"
        onPress={() => setOpen(true)}
      >
        Discard changes…
      </Button>
      <Text isDark={isDark} variant="caption" muted style={styles.note}>
        {result}
      </Text>
      <AlertDialog
        isDark={isDark}
        open={open}
        onOpenChange={setOpen}
        title="Discard changes?"
        description="Your edits will be lost."
        destructive
        confirmLabel="Discard"
        onConfirm={() => setResult("Discarded")}
        onCancel={() => setResult("Kept editing")}
      />
    </View>
  );
}

function AvatarDemo() {
  const { isDark } = useBackdropMode();
  return (
    <View style={styles.stack}>
      <Row>
        <Avatar isDark={isDark} name="Maya Chen" size="sm" />
        <Avatar isDark={isDark} name="Maya Chen" status="online" />
        <Avatar isDark={isDark} name="Jonas Berg" size="lg" status="busy" />
      </Row>
      <Text isDark={isDark} variant="caption" muted>
        Initials in a glass circle, three sizes, with presence status.
      </Text>
    </View>
  );
}

function BadgeDemo() {
  const { isDark } = useBackdropMode();
  return (
    <Row>
      <Badge isDark={isDark} tone="destructive">
        3
      </Badge>
      <Badge isDark={isDark}>New</Badge>
      <Badge isDark={isDark} tone="success">
        Synced
      </Badge>
      <Badge isDark={isDark} tone="muted">
        Draft
      </Badge>
    </Row>
  );
}

function ButtonDemo() {
  const { isDark } = useBackdropMode();
  const [taps, setTaps] = useState(0);
  return (
    <View style={styles.stack}>
      <Button
        isDark={isDark}
        accessibilityLabel="Primary glass button"
        onPress={() => setTaps((t) => t + 1)}
      >
        Primary glass button
      </Button>
      <Button
        isDark={isDark}
        accessibilityLabel="Filled button"
        variant="filled"
        onPress={() => setTaps((t) => t + 1)}
      >
        Filled button
      </Button>
      <Button
        isDark={isDark}
        accessibilityLabel="Ghost button"
        variant="ghost"
        onPress={() => setTaps((t) => t + 1)}
      >
        Ghost button
      </Button>
      <Button
        isDark={isDark}
        accessibilityLabel="Destructive button"
        tint="#dc2626"
        onPress={() => setTaps((t) => t + 1)}
      >
        Destructive
      </Button>
      <Row>
        <Button
          isDark={isDark}
          accessibilityLabel="Small button"
          size="sm"
          onPress={() => setTaps((t) => t + 1)}
        >
          Small
        </Button>
        <Button
          isDark={isDark}
          accessibilityLabel="Large button"
          size="lg"
          onPress={() => setTaps((t) => t + 1)}
        >
          Large
        </Button>
        <Button
          isDark={isDark}
          accessibilityLabel="Disabled button"
          disabled
          onPress={() => {}}
        >
          Disabled
        </Button>
      </Row>
      <Text isDark={isDark} variant="caption" muted>
        Taps so far: {taps}
      </Text>
    </View>
  );
}

function CardDemo() {
  const { isDark } = useBackdropMode();
  return (
    <Card isDark={isDark}>
      <CardHeader>
        <CardTitle>Today</CardTitle>
        <CardDescription>Activity summary</CardDescription>
      </CardHeader>
      <CardContent>
        <Text isDark={isDark}>12,480 steps — your best day this week.</Text>
      </CardContent>
      <CardFooter>
        <Button
          isDark={isDark}
          accessibilityLabel="View card details"
          size="sm"
          onPress={() => {}}
        >
          View details
        </Button>
      </CardFooter>
    </Card>
  );
}

function CheckboxDemo() {
  const { isDark } = useBackdropMode();
  const [remember, setRemember] = useState(true);
  const [news, setNews] = useState(false);
  return (
    <View style={styles.stack}>
      <Checkbox
        isDark={isDark}
        checked={remember}
        onCheckedChange={setRemember}
        label="Remember me"
      />
      <Checkbox
        isDark={isDark}
        checked={news}
        onCheckedChange={setNews}
        label="Product news"
        description="One email a month, no spam."
      />
      <Checkbox isDark={isDark} checked disabled label="Locked on" />
    </View>
  );
}

function ChipDemo() {
  const { isDark } = useBackdropMode();
  const [nearby, setNearby] = useState(true);
  const [openNow, setOpenNow] = useState(false);
  const [topRated, setTopRated] = useState(false);
  return (
    <Row>
      <Chip
        isDark={isDark}
        label="Nearby"
        selected={nearby}
        onSelectedChange={setNearby}
      />
      <Chip
        isDark={isDark}
        label="Open now"
        selected={openNow}
        onSelectedChange={setOpenNow}
      />
      <Chip
        isDark={isDark}
        label="Top rated"
        selected={topRated}
        onSelectedChange={setTopRated}
      />
    </Row>
  );
}

function CollapsibleDemo() {
  const { isDark } = useBackdropMode();
  return (
    <Collapsible
      isDark={isDark}
      defaultOpen
      trigger={
        <Text isDark={isDark} variant="heading">
          Advanced options
        </Text>
      }
    >
      <Text isDark={isDark} style={styles.note}>
        Revealed content — tap the header to fold it away again.
      </Text>
    </Collapsible>
  );
}

function ContextMenuDemo() {
  const { isDark } = useBackdropMode();
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState("Nothing picked yet");
  const pick = (label: string) => () => {
    setLast(label);
    setOpen(false);
  };
  return (
    <View>
      <ContextMenu
        isDark={isDark}
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Text isDark={isDark} variant="heading">
            Press and hold me
          </Text>
        }
        items={[
          { label: "Reply", onPress: pick("Reply") },
          { label: "Forward", onPress: pick("Forward") },
          { label: "Delete", destructive: true, onPress: pick("Delete") },
        ]}
      />
      <Text isDark={isDark} variant="caption" muted style={styles.note}>
        {last}
      </Text>
    </View>
  );
}

function DialogDemo() {
  const { isDark } = useBackdropMode();
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Button
        isDark={isDark}
        accessibilityLabel="Open dialog"
        onPress={() => setOpen(true)}
      >
        Delete file…
      </Button>
      <Dialog
        isDark={isDark}
        open={open}
        onOpenChange={setOpen}
        title="Delete file?"
        description="This cannot be undone."
        footer={
          <Row>
            <Button
              isDark={isDark}
              accessibilityLabel="Cancel delete"
              variant="ghost"
              onPress={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              isDark={isDark}
              accessibilityLabel="Confirm delete"
              tint="#dc2626"
              onPress={() => setOpen(false)}
            >
              Delete
            </Button>
          </Row>
        }
      />
    </View>
  );
}

function DialogTriggerDemo() {
  const { isDark } = useBackdropMode();
  return (
    <DialogTrigger
      isDark={isDark}
      label="Delete file…"
      title="Delete file?"
      description="This cannot be undone. The trigger owns the open state."
    >
      Delete file…
    </DialogTrigger>
  );
}

function DropdownMenuDemo() {
  const { isDark } = useBackdropMode();
  const [last, setLast] = useState("Nothing picked yet");
  return (
    <View>
      <DropdownMenu
        isDark={isDark}
        trigger={
          <Text isDark={isDark} variant="heading">
            Options ▾
          </Text>
        }
        items={[
          { label: "Edit", onPress: () => setLast("Edit") },
          { label: "Share", onPress: () => setLast("Share") },
          { label: "Delete", destructive: true, onPress: () => setLast("Delete") },
        ]}
      />
      <Text isDark={isDark} variant="caption" muted style={styles.note}>
        {last}
      </Text>
    </View>
  );
}

function FieldDemo() {
  const { isDark } = useBackdropMode();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  return (
    <View style={styles.stack}>
      <Field isDark={isDark} label="Email" description="We never share it.">
        <Input
          isDark={isDark}
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </Field>
      <Field isDark={isDark} label="Name" error={name ? undefined : "Required"}>
        <Input
          isDark={isDark}
          placeholder="Your name"
          value={name}
          onChangeText={setName}
        />
      </Field>
    </View>
  );
}

function GlassDemo() {
  const { isDark } = useBackdropMode();
  return (
    <View style={styles.stack}>
      <Glass isDark={isDark} style={styles.panel}>
        <Text isDark={isDark} variant="heading">
          Regular glass
        </Text>
        <Text isDark={isDark} variant="caption" muted style={styles.note}>
          The surface every component is built on. Switch to Image mode and
          watch it refract the photo.
        </Text>
      </Glass>
      <Glass isDark={isDark} effect="clear" style={styles.panel}>
        <Text isDark={isDark} variant="heading">
          Clear glass
        </Text>
        <Text isDark={isDark} variant="caption" muted style={styles.note}>
          The lighter material weight.
        </Text>
      </Glass>
    </View>
  );
}

function GlassViewDemo() {
  const { isDark } = useBackdropMode();
  return (
    <GlassView isDark={isDark} style={styles.panel}>
      <Text isDark={isDark} variant="heading">
        Now playing
      </Text>
      <Text isDark={isDark} variant="caption" muted style={styles.note}>
        GlassView is Glass under the engine's name — the same surface, the
        same props.
      </Text>
    </GlassView>
  );
}

function GlassContainerDemo() {
  const { isDark } = useBackdropMode();
  return (
    <GlassContainer isDark={isDark} spacing={8} style={styles.containerRow}>
      <Glass isDark={isDark} style={[styles.panel, styles.flex]}>
        <Text isDark={isDark}>One</Text>
      </Glass>
      <Glass isDark={isDark} style={[styles.panel, styles.flex]}>
        <Text isDark={isDark}>Two</Text>
      </Glass>
    </GlassContainer>
  );
}

function GlassProviderDemo() {
  const { isDark } = useBackdropMode();
  const [active, setActive] = useState("home");
  return (
    <View style={styles.stack}>
      <GlassProvider isDark={isDark}>
        <View style={styles.providerSample}>
          <Text isDark={isDark}>
            Page content the glass samples — on Android the provider records
            this backdrop; surfaces beside it read it.
          </Text>
        </View>
      </GlassProvider>
      <TabBar
        isDark={isDark}
        items={[
          { id: "home", label: "Home" },
          { id: "search", label: "Search" },
          { id: "me", label: "Profile" },
        ]}
        activeId={active}
        onTabChange={setActive}
      />
    </View>
  );
}

function GlassStackDemo() {
  const { isDark } = useBackdropMode();
  return (
    <GlassStack style={styles.stackBox}>
      <GlassStack.Layer>
        <View style={styles.layerBase}>
          <Text isDark={isDark} variant="heading">
            Base layer
          </Text>
          <Text isDark={isDark} variant="caption" muted>
            Content the upper sheet refracts.
          </Text>
        </View>
      </GlassStack.Layer>
      <GlassStack.Layer>
        <Glass isDark={isDark} style={styles.layerSheet}>
          <Text isDark={isDark} variant="heading">
            Sheet over it
          </Text>
          <Text isDark={isDark} variant="caption" muted>
            Glass in this layer reads the layer below as its backdrop.
          </Text>
        </Glass>
      </GlassStack.Layer>
    </GlassStack>
  );
}

function GlassBackdropDemo() {
  const { isDark } = useBackdropMode();
  return (
    <GlassBackdrop style={styles.backdropBox}>
      <Text isDark={isDark} variant="caption" muted>
        Row one — backdrop content
      </Text>
      <Text isDark={isDark} variant="caption" muted>
        Row two — backdrop content
      </Text>
      <Glass isDark={isDark} style={[styles.panel, styles.note]}>
        <Text isDark={isDark}>Floating pane over the backdrop</Text>
      </Glass>
    </GlassBackdrop>
  );
}

function GroupDemo() {
  const { isDark } = useBackdropMode();
  const [last, setLast] = useState("Nothing picked yet");
  return (
    <View>
      <Group>
        <Button
          isDark={isDark}
          accessibilityLabel="Cut"
          onPress={() => setLast("Cut")}
        >
          Cut
        </Button>
        <Button
          isDark={isDark}
          accessibilityLabel="Copy"
          onPress={() => setLast("Copy")}
        >
          Copy
        </Button>
        <Button
          isDark={isDark}
          accessibilityLabel="Paste"
          onPress={() => setLast("Paste")}
        >
          Paste
        </Button>
      </Group>
      <Text isDark={isDark} variant="caption" muted style={styles.note}>
        {last} — grouped buttons share one glass capsule.
      </Text>
    </View>
  );
}

function IconButtonDemo() {
  const { isDark } = useBackdropMode();
  return (
    <Row>
      <IconButton
        isDark={isDark}
        accessibilityLabel="Back"
        icon={<Text isDark={isDark}>‹</Text>}
        onPress={() => {}}
      />
      <IconButton
        isDark={isDark}
        accessibilityLabel="Share"
        size="lg"
        icon={<Text isDark={isDark}>↗</Text>}
        onPress={() => {}}
      />
      <IconButton
        isDark={isDark}
        accessibilityLabel="Favourite"
        icon={<Text isDark={isDark}>★</Text>}
        onPress={() => {}}
      />
      <IconButton
        isDark={isDark}
        accessibilityLabel="Add"
        icon={<Text isDark={isDark}>＋</Text>}
        onPress={() => {}}
      />
    </Row>
  );
}

function InputDemo() {
  const { isDark } = useBackdropMode();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <View style={styles.stack}>
      <Input
        isDark={isDark}
        placeholder="Email address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        accessibilityLabel="Email address"
      />
      <Input
        isDark={isDark}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        accessibilityLabel="Password"
      />
      <Text isDark={isDark} variant="caption" muted>
        {email ? `Typing as ${email}` : "Start typing — the field is live."}
      </Text>
    </View>
  );
}

function LabelDemo() {
  const { isDark } = useBackdropMode();
  const [value, setValue] = useState("");
  return (
    <View style={styles.stack}>
      <Label isDark={isDark}>Email address</Label>
      <Input
        isDark={isDark}
        placeholder="you@example.com"
        value={value}
        onChangeText={setValue}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Label isDark={isDark} required>
        Required field
      </Label>
    </View>
  );
}

function MorphGroupDemo() {
  const { isDark } = useBackdropMode();
  const [last, setLast] = useState("Drag one capsule onto another");
  return (
    <View>
      <MorphGroup
        items={[
          { key: "reply", label: "Reply" },
          { key: "forward", label: "Forward" },
          { key: "archive", label: "Archive" },
        ]}
        onMerge={(from, to) => setLast(`Merged ${from} onto ${to}`)}
        onItemPress={(key) => setLast(`Tapped ${key}`)}
      />
      <Text isDark={isDark} variant="caption" muted style={styles.note}>
        {last}
      </Text>
    </View>
  );
}

function PopoverDemo() {
  const { isDark } = useBackdropMode();
  return (
    <Popover
      isDark={isDark}
      trigger={
        <Text isDark={isDark} variant="heading">
          Details ▾
        </Text>
      }
    >
      <Text isDark={isDark}>
        Anchored panel content — the popover floats over the backdrop and
        refracts it.
      </Text>
    </Popover>
  );
}

function ProgressDemo() {
  const { isDark } = useBackdropMode();
  const [value, setValue] = useState(62);
  return (
    <View style={styles.stack}>
      <Progress isDark={isDark} value={value} accessibilityLabel="Upload progress" />
      <Text isDark={isDark} variant="caption" muted>
        {Math.round(value)}% — drag the slider to move it.
      </Text>
      <Slider
        isDark={isDark}
        value={value}
        onValueChange={setValue}
        accessibilityLabel="Progress value"
      />
    </View>
  );
}

function RadioGroupDemo() {
  const { isDark } = useBackdropMode();
  const [value, setValue] = useState("a");
  return (
    <View style={styles.stack}>
      <RadioGroup
        isDark={isDark}
        value={value}
        onValueChange={setValue}
        options={SHIPPING_OPTIONS}
      />
      <Text isDark={isDark} variant="caption" muted>
        Selected: {value === "a" ? "Standard" : "Express"}
      </Text>
    </View>
  );
}

function ScrimDemo() {
  const { isDark } = useBackdropMode();
  const [active, setActive] = useState("home");
  return (
    <View style={styles.scrimBox}>
      <Text isDark={isDark} variant="caption" muted>
        Content sitting under the bar — line after line of it, so the scrim
        has something to soften. The scrim ramps a blur up from the bottom
        edge and keeps the bar legible over busy content.
      </Text>
      <Scrim edge="bottom" size={120}>
        <TabBar
          isDark={isDark}
          items={[
            { id: "home", label: "Home" },
            { id: "search", label: "Search" },
            { id: "me", label: "Profile" },
          ]}
          activeId={active}
          onTabChange={setActive}
        />
      </Scrim>
    </View>
  );
}

function SegmentedControlDemo() {
  const { isDark } = useBackdropMode();
  const [index, setIndex] = useState(0);
  const names = ["Day", "Week", "Month"];
  return (
    <View style={styles.stack}>
      <SegmentedControl
        isDark={isDark}
        segments={names}
        selectedIndex={index}
        onChange={setIndex}
        accessibilityLabel="Range"
      />
      <Text isDark={isDark} variant="caption" muted>
        Showing the {names[index].toLowerCase()} view.
      </Text>
    </View>
  );
}

function SelectDemo() {
  const { isDark } = useBackdropMode();
  const [value, setValue] = useState("a");
  return (
    <View style={styles.stack}>
      <Select
        isDark={isDark}
        value={value}
        onValueChange={setValue}
        options={SHIPPING_OPTIONS}
        accessibilityLabel="Shipping speed"
      />
      <Text isDark={isDark} variant="caption" muted>
        Selected: {value === "a" ? "Standard" : "Express"}
      </Text>
    </View>
  );
}

function SeparatorDemo() {
  const { isDark } = useBackdropMode();
  return (
    <View>
      <Text isDark={isDark}>First section</Text>
      <Separator isDark={isDark} inset={16} style={styles.separatorGap} />
      <Text isDark={isDark}>Second section</Text>
      <Separator isDark={isDark} style={styles.separatorGap} />
      <Text isDark={isDark}>Third section — this separator runs full width.</Text>
    </View>
  );
}

function SheetDemo() {
  const { isDark } = useBackdropMode();
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.sheetStage}>
      <Button
        isDark={isDark}
        accessibilityLabel="Open sheet"
        onPress={() => setVisible(true)}
      >
        Open sheet
      </Button>
      <Sheet isDark={isDark} visible={visible} height={190} onDismiss={() => setVisible(false)}>
        <View style={styles.sheetContent}>
          <Text isDark={isDark} variant="heading">
            Sheet content
          </Text>
          <Text isDark={isDark} variant="caption" muted style={styles.note}>
            Drag it down, fling it, or tap the dim behind it to dismiss.
          </Text>
          <Button
            isDark={isDark}
            accessibilityLabel="Close sheet"
            onPress={() => setVisible(false)}
          >
            Done
          </Button>
        </View>
      </Sheet>
    </View>
  );
}

function SkeletonDemo() {
  const { isDark } = useBackdropMode();
  return (
    <View style={styles.stack}>
      <Skeleton isDark={isDark} shape="circle" height={44} />
      <Skeleton isDark={isDark} shape="line" width="60%" />
      <Skeleton isDark={isDark} shape="line" width="40%" />
      <Skeleton isDark={isDark} shape="rect" height={72} />
    </View>
  );
}

function SliderDemo() {
  const { isDark } = useBackdropMode();
  const [value, setValue] = useState(62);
  return (
    <View style={styles.stack}>
      <Slider
        isDark={isDark}
        value={value}
        onValueChange={setValue}
        accessibilityLabel="Volume"
      />
      <Text isDark={isDark} variant="caption" muted>
        Volume: {Math.round(value)}
      </Text>
    </View>
  );
}

function StepperDemo() {
  const { isDark } = useBackdropMode();
  const [guests, setGuests] = useState(2);
  return (
    <View style={styles.stack}>
      <Row>
        <Text isDark={isDark}>Guests</Text>
        <Stepper
          isDark={isDark}
          value={guests}
          onValueChange={setGuests}
          min={1}
          max={8}
          accessibilityLabel="Guests"
        />
      </Row>
      <Text isDark={isDark} variant="caption" muted>
        {guests} {guests === 1 ? "guest" : "guests"} — bounded 1 to 8.
      </Text>
    </View>
  );
}

function SwitchDemo() {
  const { isDark } = useBackdropMode();
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(false);
  return (
    <View style={styles.stack}>
      <Row>
        <Text isDark={isDark} style={styles.flex}>
          Notifications
        </Text>
        <Switch
          isDark={isDark}
          value={notifications}
          onValueChange={setNotifications}
          accessibilityLabel="Notifications"
        />
      </Row>
      <Row>
        <Text isDark={isDark} style={styles.flex}>
          Sounds
        </Text>
        <Switch
          isDark={isDark}
          value={sounds}
          onValueChange={setSounds}
          accessibilityLabel="Sounds"
        />
      </Row>
      <Row>
        <Text isDark={isDark} style={styles.flex}>
          Disabled
        </Text>
        <Switch isDark={isDark} value disabled accessibilityLabel="Disabled switch" />
      </Row>
    </View>
  );
}

function TabBarDemo() {
  const { isDark } = useBackdropMode();
  const [active, setActive] = useState("home");
  return (
    <View style={styles.stack}>
      <TabBar
        isDark={isDark}
        items={[
          { id: "home", label: "Home" },
          { id: "search", label: "Search" },
          { id: "alerts", label: "Alerts" },
          { id: "me", label: "Profile" },
        ]}
        activeId={active}
        onTabChange={setActive}
      />
      <Text isDark={isDark} variant="caption" muted>
        Active tab: {active}
      </Text>
    </View>
  );
}

function TabsDemo() {
  const { isDark } = useBackdropMode();
  const [active, setActive] = useState("a");
  return (
    <View style={styles.stack}>
      <Tabs
        isDark={isDark}
        items={[
          { id: "a", label: "Overview" },
          { id: "b", label: "Details" },
          { id: "c", label: "Reviews" },
        ]}
        activeId={active}
        onTabChange={setActive}
      />
      <Text isDark={isDark}>
        {active === "a"
          ? "The overview panel."
          : active === "b"
            ? "The details panel."
            : "The reviews panel."}
      </Text>
    </View>
  );
}

function TextDemo() {
  const { isDark } = useBackdropMode();
  return (
    <View style={styles.stack}>
      <Text isDark={isDark} variant="title">
        Good morning — title
      </Text>
      <Text isDark={isDark} variant="heading">
        A heading
      </Text>
      <Text isDark={isDark} variant="body">
        Body text: your summary is ready.
      </Text>
      <Text isDark={isDark} variant="label">
        A label
      </Text>
      <Text isDark={isDark} variant="caption" muted>
        Caption, muted — updated just now
      </Text>
      <Text isDark={isDark} variant="body" destructive>
        Destructive body text
      </Text>
    </View>
  );
}

function TextareaDemo() {
  const { isDark } = useBackdropMode();
  const [value, setValue] = useState("");
  return (
    <View style={styles.stack}>
      <Textarea
        isDark={isDark}
        placeholder="Tell us more"
        rows={3}
        value={value}
        onChangeText={setValue}
        accessibilityLabel="Tell us more"
      />
      <Text isDark={isDark} variant="caption" muted>
        {value.length} characters
      </Text>
    </View>
  );
}

function ToastDemo() {
  const { isDark } = useBackdropMode();
  const [visible, setVisible] = useState(false);
  return (
    <View>
      <Button
        isDark={isDark}
        accessibilityLabel="Show toast"
        onPress={() => setVisible(true)}
      >
        Save something
      </Button>
      <Toast
        isDark={isDark}
        visible={visible}
        message="Saved"
        onDismiss={() => setVisible(false)}
      />
    </View>
  );
}

function ToggleDemo() {
  const { isDark } = useBackdropMode();
  const [bold, setBold] = useState(true);
  const [italic, setItalic] = useState(false);
  return (
    <Row>
      <Toggle
        isDark={isDark}
        pressed={bold}
        onPressedChange={setBold}
        accessibilityLabel="Bold"
      >
        B
      </Toggle>
      <Toggle
        isDark={isDark}
        pressed={italic}
        onPressedChange={setItalic}
        accessibilityLabel="Italic"
      >
        I
      </Toggle>
    </Row>
  );
}

function ToggleGroupDemo() {
  const { isDark } = useBackdropMode();
  const [values, setValues] = useState<string[]>(["bold"]);
  const [align, setAlign] = useState<string>("left");
  return (
    <View style={styles.stack}>
      <ToggleGroup
        isDark={isDark}
        items={[
          { value: "bold", label: "Bold" },
          { value: "italic", label: "Italic" },
          { value: "underline", label: "Underline" },
        ]}
        multiple
        value={values}
        onValueChange={(v) => setValues(v as string[])}
        accessibilityLabel="Text style"
      />
      <ToggleGroup
        isDark={isDark}
        items={[
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
        ]}
        value={align}
        onValueChange={(v) => setAlign(v as string)}
        accessibilityLabel="Alignment"
      />
      <Text isDark={isDark} variant="caption" muted>
        Style: {values.join(", ") || "none"} · Align: {align}
      </Text>
    </View>
  );
}

function ToolbarDemo() {
  const { isDark } = useBackdropMode();
  return (
    <Toolbar
      isDark={isDark}
      title="Inbox"
      leading={
        <IconButton
          isDark={isDark}
          accessibilityLabel="Back"
          icon={<Text isDark={isDark}>‹</Text>}
          onPress={() => {}}
        />
      }
      trailing={
        <IconButton
          isDark={isDark}
          accessibilityLabel="Share"
          icon={<Text isDark={isDark}>↗</Text>}
          onPress={() => {}}
        />
      }
    />
  );
}

function TooltipDemo() {
  const { isDark } = useBackdropMode();
  return (
    <View style={styles.stack}>
      <Tooltip isDark={isDark} label="Add to favourites">
        <Text isDark={isDark} variant="title">
          ★
        </Text>
      </Tooltip>
      <Text isDark={isDark} variant="caption" muted>
        Press and hold the star.
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */

export const DEMOS: Record<string, ComponentType> = {
  accordion: AccordionDemo,
  "action-sheet": ActionSheetDemo,
  alert: AlertDemo,
  "alert-dialog": AlertDialogDemo,
  avatar: AvatarDemo,
  badge: BadgeDemo,
  button: ButtonDemo,
  card: CardDemo,
  checkbox: CheckboxDemo,
  chip: ChipDemo,
  collapsible: CollapsibleDemo,
  "context-menu": ContextMenuDemo,
  dialog: DialogDemo,
  "dialog-trigger": DialogTriggerDemo,
  "dropdown-menu": DropdownMenuDemo,
  field: FieldDemo,
  glass: GlassDemo,
  "glass-backdrop": GlassBackdropDemo,
  "glass-container": GlassContainerDemo,
  "glass-provider": GlassProviderDemo,
  "glass-stack": GlassStackDemo,
  "glass-view": GlassViewDemo,
  group: GroupDemo,
  "icon-button": IconButtonDemo,
  input: InputDemo,
  label: LabelDemo,
  "morph-group": MorphGroupDemo,
  popover: PopoverDemo,
  progress: ProgressDemo,
  "radio-group": RadioGroupDemo,
  scrim: ScrimDemo,
  "segmented-control": SegmentedControlDemo,
  select: SelectDemo,
  separator: SeparatorDemo,
  sheet: SheetDemo,
  skeleton: SkeletonDemo,
  slider: SliderDemo,
  stepper: StepperDemo,
  switch: SwitchDemo,
  "tab-bar": TabBarDemo,
  tabs: TabsDemo,
  text: TextDemo,
  textarea: TextareaDemo,
  toast: ToastDemo,
  toggle: ToggleDemo,
  "toggle-group": ToggleGroupDemo,
  toolbar: ToolbarDemo,
  tooltip: TooltipDemo,
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  stack: { gap: 14 },
  note: { marginTop: 10 },
  panel: { padding: 20, borderRadius: 18 },
  flex: { flex: 1 },
  containerRow: { flexDirection: "row", gap: 8 },
  providerSample: { padding: 16 },
  stackBox: { height: 210 },
  layerBase: { flex: 1, padding: 20, justifyContent: "flex-end" },
  layerSheet: {
    position: "absolute",
    top: 18,
    left: 18,
    right: 60,
    padding: 16,
    borderRadius: 18,
  },
  backdropBox: { padding: 16, minHeight: 150 },
  separatorGap: { marginVertical: 10 },
  sheetStage: { minHeight: 230 },
  sheetContent: { padding: 20, gap: 10 },
  scrimBox: {
    position: "relative",
    height: 230,
    overflow: "hidden",
    padding: 14,
  },
});
