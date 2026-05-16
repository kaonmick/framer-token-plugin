import type { Meta, StoryObj } from "@storybook/react-vite"
import { JsonFileDropZone } from "../../components/JsonFileDropZone.tsx"

const meta = {
  title: "Components/JsonFileDropZone",
  component: JsonFileDropZone,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof JsonFileDropZone>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    labels: {
      button: "アップロード",
      title: "JSONファイルをドロップ、またはアップロード",
    },
    onFileSelect: async file => {
      console.log(`Selected ${file.name}`)
    },
  },
  render: args => (
    <div className="w-[500px] max-w-full">
      <JsonFileDropZone {...args} />
    </div>
  ),
}
