# Pstack สำหรับ Kiro CLI

ชุด [pstack](https://github.com/cursor/plugins/tree/main/pstack) เต็ม port มารัน
บน Kiro CLI. มีครบทั้ง 51 skills, 23 playbooks, และ subagent role `poteto-agent`
wire ให้เข้ากับ skill discovery, subagent tool, และ steering files ของ Kiro.

(English version: [README.md](README.md))

> อยากให้ pstack อ่าน specs, steering, hooks, MCP ของ Kiro ด้วยไหม ดู branch
> `kiro-core-feature-integration` ที่ต่อ pstack เข้ากับ Kiro features เหล่านั้น.

## pstack คืออะไร

pstack เป็น agent operating system แบบ structured. `/poteto-mode` เป็น router.
คุณให้งานมัน มัน match playbook, ใช้ principles, delegate ผ่าน subagents, และเขียน
งานที่ verify แล้ว. skill ที่มันเรียกใช้ เช่น:

| Skill | ทำอะไร |
|---|---|
| `/poteto-mode` | Router. match งานกับ playbook แล้วขับ |
| `/how` | อธิบายว่า subsystem ทำงานยังไงก่อนแก้ |
| `/why` | ไล่ว่าทำไมถึงตัดสินใจแบบนั้น พร้อมหลักฐาน |
| `/teach` | อธิบายงานให้เข้าใจจริง |
| `/architect` | สำรวจ design แบบ parallel ก่อน implement |
| `/arena` | N candidate ที่งานเดียวกัน เลือกตัวดีสุด |
| `/swarm` | fan-out worker สำหรับ coverage, race, exploration |
| `/interrogate` | multi-model adversarial review ก่อน ship |
| `/reflect` | review transcript แล้ว route learning ไปแก้ skill |
| `/tdd` | test-driven development เมื่อสั่ง |
| `/unslop` | ตัด AI tells ออกจาก prose |
| `/no-comments` | ตัด comment ที่ไม่จำเป็นก่อน review |
| `/technical-writing` | มาตรฐานการเขียน doc, PR, commit |
| `/setup-pstack` | เลือกว่าแต่ละ role ใช้ model ไหน |

บวก principle skills อีก 24 ตัว (`principle-laziness-protocol`,
`principle-fix-root-causes`, `principle-model-the-domain` ฯลฯ) ที่ ground ทุกการ
ตัดสินใจ.

## เปลี่ยนอะไรจาก version Cursor

รายละเอียดเต็มอยู่ใน `.kiro/skills/poteto-mode/references/kiro-compat.md`. สรุปสั้น:

| Cursor | Kiro |
|---|---|
| `Task` tool | `subagent` tool (DAG stages) |
| `subagent_type: "poteto-agent"` | stage `role: "poteto-agent"` |
| `~/.cursor/rules/*.mdc` (`alwaysApply`) | `.kiro/steering/*.md` (`inclusion: always`) |
| model slug (`grok-4.7-xhigh-fast`) | Kiro model id หรือ `auto` |
| `cursor-team-kit` (`/deslop`, `control-*`) | ไม่มี degrade เป็น manual |
| `AskQuestion` tool | prose question ในคำตอบ |

## ความต้องการ

- **Kiro CLI** (`kiro-cli`) อยู่ใน PATH.
- **Node.js** สำหรับ verification harness.
- **`gh`** (optional) สำหรับ PR playbooks.

## ติดตั้ง

### Global (ทุก workspace)

```bash
git clone https://github.com/auaii/Pstack-kiro-harness.git
cd Pstack-kiro-harness
chmod +x install.sh
./install.sh global
```

copy ทั้ง 51 skills ไป `~/.kiro/skills/` และ agent config ไป `~/.kiro/agents/`,
validate, แล้วรัน harness. agent config ใช้ path `~/...` จึงไม่ต้องแก้ path.

### Workspace (โปรเจกต์เดียว)

จาก root ของโปรเจกต์:

```bash
/path/to/Pstack-kiro-harness/install.sh workspace
```

ติดตั้งใต้ `./.kiro/skills/` และ `./.kiro/agents/`. workspace override global.

### ติดตั้งด้วยมือ

agent config ใช้ path `~/...` การ copy ตรงๆ จึงใช้ได้สำหรับ global install.

1. copy ทุกอย่างใต้ `.kiro/skills/` ไป `~/.kiro/skills/`.
2. copy `.kiro/agents/poteto-agent.json` ไป `~/.kiro/agents/`.
3. รัน `kiro-cli agent validate --path ~/.kiro/agents/poteto-agent.json`.

## ใช้งาน

pstack skills ทำงานเป็น slash command ใน `kiro-cli chat`. หลังติดตั้ง global ทุก
session เห็น skill ทั้งหมดเพราะ default agent inherit
`skill://~/.kiro/skills/*/SKILL.md`. tab completion ใช้ได้ (`/pote<Tab>` เป็น
`/poteto-mode`). ไม่ต้อง switch agent.

### เริ่ม mode

```
/poteto-mode <งานของคุณ>
```

router อ่านงาน match playbook (Feature, Bug fix, Investigation, Refactoring,
Prototype ฯลฯ), เปิด todo list ด้วย step ของ playbook นั้น, แล้วทำทีละ step.

### เข้าใจก่อนแก้

```
/how <subsystem>          # ทำงานยังไง
/why <decision>           # ทำไมสร้างแบบนี้
/teach <topic>            # อธิบายให้เข้าใจ
/recall <work context>    # กำลังทำอะไรอยู่
```

### design ก่อนเขียนโค้ด

```
/architect <feature>      # parallel design exploration
/arena <alternatives>     # N candidate เลือกดีสุด
/swarm <coverage target>  # fan-out coverage
/interrogate              # multi-model review
```

### build และ clean

```
/tdd <feature>            # test-driven เมื่อสั่ง
/unslop                   # ตัด AI tells
/no-comments              # ตัด comment ก่อน review
/technical-writing        # มาตรฐานเขียน doc กับ PR
```

### ตั้ง model ต่อ role

```
/setup-pstack
```

ถาม reasoning budget แล้วเขียน `~/.kiro/steering/pstack-models.md`. default เป็น
`auto` (ใช้ model ของแชตหลัก). pin Kiro model id ต่อ role ได้ถ้ามี.

### verify การ port

```bash
node ~/.kiro/skills/poteto-mode/scripts/verify-kiro-compat.mjs
```

26 assertions กับ artifact จริง. exit non-zero ถ้า fail.

## โครงสร้าง

```
Pstack-kiro-harness/
├── install.sh
├── README.md / README.th.md
├── LICENSE
├── docs/guide/              # คู่มือ 11 หน้า
└── .kiro/
    ├── agents/
    │   ├── poteto-agent.json
    │   ├── poteto-agent.md
    │   └── comment-sicko.md
    └── skills/               # 51 skills
```

## ขอบเขต

repo นี้ส่ง pstack skill set ครบชุด. `cursor-team-kit` (`/deslop`, `control-*`)
และ Cursor-cloud (bugbot, agentic security review) ไม่มี Kiro equivalent และ
degrade เป็น manual. playbook ที่ขับ `gh` ทำงานได้เมื่อติดตั้ง `gh`.

## License

เหมือน repo ต้นทาง [cursor/plugins](https://github.com/cursor/plugins).
