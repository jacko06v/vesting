import { PageHeader, PageHeaderHeading } from "@/components/layout/page-header"

import Card from "./card"

export default function HomePage() {
  return (
    <div className="container relative mt-20 px-0">
      <PageHeader className="pb-8">
        <PageHeaderHeading style={{ marginBottom: "5px", zIndex: 11 }}>
          Dashboard
        </PageHeaderHeading>
        <Card />
      </PageHeader>
    </div>
  )
}
