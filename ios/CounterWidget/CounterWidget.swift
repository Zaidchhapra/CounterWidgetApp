import WidgetKit
import SwiftUI
import Intents

struct CounterWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> CounterEntry {
        CounterEntry(date: Date(), count: 0)
    }

    func getSnapshot(in context: Context, completion: @escaping (CounterEntry) -> ()) {
        let entry = CounterEntry(date: Date(), count: getCounterValue())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let currentDate = Date()
        let count = getCounterValue()
        let entry = CounterEntry(date: currentDate, count: count)
        
        // Update every 5 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 5, to: currentDate)!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func getCounterValue() -> Int {
        let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let sharedPath = documentsPath.appendingPathComponent("shared")
        let counterFile = sharedPath.appendingPathComponent("counter.json")
        
        guard let data = try? Data(contentsOf: counterFile),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let value = json["value"] as? Int else {
            return 0
        }
        
        return value
    }
}

struct CounterEntry: TimelineEntry {
    let date: Date
    let count: Int
}

struct CounterWidgetEntryView: View {
    var entry: CounterWidgetProvider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        ZStack {
            Color(.systemBackground)
            
            VStack(spacing: 8) {
                Text("Counter")
                    .font(.headline)
                    .foregroundColor(.secondary)
                
                Text("\(entry.count)")
                    .font(.system(size: fontSize, weight: .bold, design: .rounded))
                    .foregroundColor(.primary)
                
                if #available(iOS 16.0, *) {
                    HStack(spacing: 12) {
                        Button(intent: DecrementIntent()) {
                            Image(systemName: "minus.circle.fill")
                                .font(.title2)
                                .foregroundColor(.red)
                        }
                        .buttonStyle(.plain)
                        
                        Button(intent: IncrementIntent()) {
                            Image(systemName: "plus.circle.fill")
                                .font(.title2)
                                .foregroundColor(.green)
                        }
                        .buttonStyle(.plain)
                    }
                } else {
                    Text("Tap app to update")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            .padding()
        }
    }
    
    private var fontSize: CGFloat {
        switch family {
        case .systemSmall:
            return 32
        case .systemMedium:
            return 40
        case .systemLarge:
            return 48
        @unknown default:
            return 32
        }
    }
}

struct CounterWidget: Widget {
    let kind: String = "CounterWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CounterWidgetProvider()) { entry in
            CounterWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Counter Widget")
        .description("Keep track of your counter right from your home screen.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

// iOS 16+ Interactive Intents
@available(iOS 16.0, *)
struct IncrementIntent: AppIntent {
    static var title: LocalizedStringResource = "Increment Counter"
    
    func perform() async throws -> some IntentResult {
        updateCounter(increment: true)
        return .result()
    }
}

@available(iOS 16.0, *)
struct DecrementIntent: AppIntent {
    static var title: LocalizedStringResource = "Decrement Counter"
    
    func perform() async throws -> some IntentResult {
        updateCounter(increment: false)
        return .result()
    }
}

private func updateCounter(increment: Bool) {
    let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    let sharedPath = documentsPath.appendingPathComponent("shared")
    let counterFile = sharedPath.appendingPathComponent("counter.json")
    
    // Create directory if it doesn't exist
    try? FileManager.default.createDirectory(at: sharedPath, withIntermediateDirectories: true)
    
    var currentCount = 0
    if let data = try? Data(contentsOf: counterFile),
       let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
       let value = json["value"] as? Int {
        currentCount = value
    }
    
    let newCount = increment ? currentCount + 1 : max(0, currentCount - 1)
    
    let updatedData: [String: Any] = [
        "value": newCount,
        "lastUpdated": Date().timeIntervalSince1970 * 1000
    ]
    
    if let jsonData = try? JSONSerialization.data(withJSONObject: updatedData) {
        try? jsonData.write(to: counterFile)
    }
    
    // Reload all timelines
    WidgetCenter.shared.reloadAllTimelines()
}

struct CounterWidget_Previews: PreviewProvider {
    static var previews: some View {
        CounterWidgetEntryView(entry: CounterEntry(date: Date(), count: 42))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}
