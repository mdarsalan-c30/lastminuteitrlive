import json

transcript_path = r'C:\Users\MD ARSALAN\.gemini\antigravity\brain\6c80a37b-1e00-4314-b0eb-33c3e65b709e\.system_generated\logs\transcript_full.jsonl'
with open(transcript_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

user_messages = []
for line in lines:
    try:
        data = json.loads(line)
        if data.get('type') == 'USER_INPUT':
            user_messages.append(data.get('content'))
    except json.JSONDecodeError:
        pass

if user_messages:
    last_message = user_messages[-1]
    with open('scratch/legal_text.md', 'w', encoding='utf-8') as f:
        f.write(last_message)
    print("Extracted to scratch/legal_text.md")
else:
    print("No user messages found")
