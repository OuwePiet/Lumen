type NFTHistoryProps = {
  postTimestampNanos?: number
  editionCount: number
  uniqueOwnerCount: number
  forSaleCount: number
  saleStatus: string
}

function formatOnChainDate(timestampNanos?: number) {
  if (!timestampNanos) return "Date not available"

  const date = new Date(timestampNanos / 1_000_000)
  if (Number.isNaN(date.getTime())) return "Date not available"

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

const styles = {
  details: {
    border: "1px solid #285f40",
    borderRadius: "12px",
    marginTop: "22px",
    overflow: "hidden",
  },
  summary: {
    color: "#b9ffd4",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 800,
    padding: "14px 16px",
  },
  content: {
    borderTop: "1px solid #254233",
    padding: "4px 16px 16px",
  },
  event: {
    borderBottom: "1px solid #1d3328",
    padding: "14px 0",
  },
  eventLast: {
    padding: "14px 0 4px",
  },
  title: {
    color: "#f4f7f5",
    fontSize: "14px",
    fontWeight: 700,
    margin: "0 0 5px",
  },
  text: {
    color: "#a9b8af",
    fontSize: "13px",
    lineHeight: 1.5,
    margin: 0,
  },
  note: {
    color: "#84958b",
    fontSize: "12px",
    lineHeight: 1.5,
    margin: "16px 0 0",
  },
}

export default function NFTHistory({
  postTimestampNanos,
  editionCount,
  uniqueOwnerCount,
  forSaleCount,
  saleStatus,
}: NFTHistoryProps) {
  const events = [
    {
      title: "Original DeSo post",
      text: `Recorded on ${formatOnChainDate(postTimestampNanos)} (UTC).`,
    },
    {
      title: "NFT collection verified",
      text: `${editionCount} on-chain edition${editionCount === 1 ? "" : "s"} found.`,
    },
    {
      title: "Current ownership snapshot",
      text: `${uniqueOwnerCount} unique owner${uniqueOwnerCount === 1 ? "" : "s"} across ${editionCount} edition${editionCount === 1 ? "" : "s"}.`,
    },
    {
      title: "Current market snapshot",
      text: `${forSaleCount} edition${forSaleCount === 1 ? "" : "s"} for sale. ${saleStatus}.`,
    },
  ]

  return (
    <details style={styles.details}>
      <summary style={styles.summary}>View NFT history</summary>
      <div style={styles.content}>
        {events.map((event, index) => (
          <div
            key={event.title}
            style={index === events.length - 1 ? styles.eventLast : styles.event}
          >
            <p style={styles.title}>{event.title}</p>
            <p style={styles.text}>{event.text}</p>
          </div>
        ))}
        <p style={styles.note}>
          This read-only record uses direct DeSo data. Lumen does not infer
          earlier transfers or sales that the current direct endpoint does not
          return.
        </p>
      </div>
    </details>
  )
}
