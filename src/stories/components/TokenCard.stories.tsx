import type { Meta, StoryObj } from "@storybook/react-vite"
import { TokenCard } from "../../components/TokenCard.tsx"
import { PluginPreviewFrame } from "../fixtures/storyLayout.tsx"

const meta = {
  title: "Components/TokenCard",
  component: TokenCard,
  decorators: [
    Story => (
      <PluginPreviewFrame>
        <Story />
      </PluginPreviewFrame>
    ),
  ],
  args: {
    label: "",
    checked: false,
    radioName: undefined,
    radioValue: "candidate",
    rows: [
      {
        value: "rgba(255, 240, 133, 1)",
        name: "brand / primary",
        badge: { color: "rgba(255, 240, 133, 1)" },
      },
    ],
  },
} satisfies Meta<typeof TokenCard>

export default meta
type Story = StoryObj<typeof meta>

export const Summary: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <TokenCard
        label=""
        checked={false}
        radioName={undefined}
        radioValue="candidate"
        rows={[
          {
            value: "rgba(255, 240, 133, 1)",
            name: "brand / primary",
            badge: { color: "rgba(255, 240, 133, 1)" },
          },
        ]}
      />
      <TokenCard
        label=""
        checked={false}
        radioName={undefined}
        radioValue="light-dark"
        rows={[
          {
            mode: "light",
            modeLabel: "Light",
            value: "#fff085",
            name: "semantic / accent / primary",
            badge: { color: "#fff085" },
          },
          {
            mode: "dark",
            modeLabel: "Dark",
            value: "#713f12",
            name: "semantic / accent / primary",
            badge: { color: "#713f12" },
          },
        ]}
      />
      <TokenCard
        label="Existing style"
        radioName="semantic-accent-primary-summary"
        radioValue="existing"
        checked
        rows={[
          {
            value: "#facc15",
            name: "semantic / accent / primary",
            badge: { color: "#facc15" },
          },
        ]}
      />
    </div>
  ),
}

export const Default: Story = {}

export const LightDark: Story = {
  args: {
    rows: [
      {
        mode: "light",
        modeLabel: "Light",
        value: "#fff085",
        name: "semantic / accent / primary",
        badge: { color: "#fff085" },
      },
      {
        mode: "dark",
        modeLabel: "Dark",
        value: "#713f12",
        name: "semantic / accent / primary",
        badge: { color: "#713f12" },
      },
    ],
  },
}

export const SelectedConflict: Story = {
  args: {
    label: "Existing style",
    radioName: "semantic-accent-primary",
    radioValue: "existing",
    checked: true,
    rows: [
      {
        value: "#facc15",
        name: "semantic / accent / primary",
        badge: { color: "#facc15" },
      },
    ],
  },
}
