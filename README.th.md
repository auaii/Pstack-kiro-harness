# Pstack สำหรับ Kiro

> **Branch `kiro-core-feature-integration`.**
> ใช้ `main` ถ้าต้องการ port พื้นฐาน. ใช้ branch นี้เมื่อโปรเจกต์ Kiro ของคุณมี
> specs, steering, hooks หรือ MCP servers และอยากให้ pstack อ่านและใช้มันจริง.

(English version: [README.md](README.md))

## branch นี้เชื่อม pstack เข้ากับ Kiro features อย่างไร

Kiro CLI มี feature ในตัวที่ Cursor ไม่มี. branch `main` ไม่สนใจมันเลย. branch นี้
ต่อ pstack เข้ากับทุกตัว. ด้านล่างคือแต่ละ Kiro feature ทำอะไร และ pstack ทำอะไรกับมัน.

### 1. Kiro Specs

**Kiro ให้อะไร.** คุณเขียน requirements แบบ structured ใน
`.kiro/specs/<name>/requirements.md` พร้อม acceptance criteria เช่น "WHEN ผู้ใช้
กดส่งฟอร์ม THE controller SHALL trim และ escape ทุก field." Kiro สร้างให้ได้จาก
prompt. ไฟล์อยู่ใน repo ของคุณ.

**main branch ทำอะไร.** ไม่สนใจ. Feature playbook เดา requirements จาก prompt ที่คุยในแชต.

**branch นี้ทำอะไร.** Feature และ Bug fix playbook อ่าน spec ก่อน. แต่ละ
acceptance criterion กลายเป็น done-check. agent verify งานกับ criteria เหล่านั้น
ไม่ใช่กับสิ่งที่เดาจากคำพูด.

**ตัวอย่าง flow.**
```
คุณมี:    .kiro/specs/student-search-filter/requirements.md (6 requirements, 13 acceptance criteria)
คุณพิมพ์:  /poteto-mode implement the student-search-filter spec
agent ทำ:  อ่าน spec → architect → build → verify ทุก criterion → เสร็จ
```

### 2. Kiro Steering

**Kiro ให้อะไร.** ไฟล์ markdown ใน `.kiro/steering/` ที่อธิบาย convention ของ
โปรเจกต์. เช่น `tech.md` บอกว่า "ใช้ callback-style DB ไม่ใช่ async/await" และ
"ใช้ parameterized query ไม่ใช่ string interpolation." steering โหลดเข้า context
ทุก turn อัตโนมัติ.

**main branch ทำอะไร.** steering เข้า context แต่ไม่มี skill ไหนพูดถึง. agent อาจ
ทำตาม อาจไม่ทำ.

**branch นี้ทำอะไร.** `/how` และ Investigation playbook อ่าน steering ก่อนชัดเจน.
agent บอกชื่อ convention และทำตาม.

**ตัวอย่าง flow.**
```
คุณมี:    .kiro/steering/tech.md (บอก: callback-style DB, express-validator, ห้าม async/await)
คุณพิมพ์:  /how does the supplier model layer work
agent ทำ:  อ่าน tech.md → อธิบายด้วย callback style, บอก pattern per-request connection
ถ้าไม่มี branch นี้: อาจอธิบายด้วย async/await จาก generic Express docs
```

### 3. Kiro Hooks

**Kiro ให้อะไร.** ไฟล์ JSON ใน `.kiro/hooks/` ที่รัน action ตอนจังหวะเฉพาะ. hook
แบบ `Stop` ทำงานหลังจบ turn ของ agent ทุกครั้ง. คุณมีอยู่แล้วหนึ่งตัว
(`session-report.json`) ที่เขียน report หลังทุก turn.

**main branch ทำอะไร.** ไม่มีอะไร. skill `show-me-your-work` เขียน decision trail
ด้วยมือ และ agent ต้องจำว่าต้องเขียน.

**branch นี้ทำอะไร.** ส่ง `hooks/show-me-your-work.json` ซึ่งเป็น Stop hook ที่
เขียน decision trail อัตโนมัติ. ติดตั้งครั้งเดียว trail เขียนตัวเอง.

**ตัวอย่าง flow.**
```
คุณติดตั้ง: cp hooks/show-me-your-work.json ~/.kiro/hooks/
คุณพิมพ์:   /poteto-mode migrate the auth module (จะไปนอนแล้ว เชื่อตอนตื่นมา)
agent ทำ:   ทำงานทั้งคืน ทุก turn เขียนแถวลง decisions.tsv อัตโนมัติ
คุณตื่นมา:  เปิด decisions.tsv เห็นทุก decision หลักฐาน และผลลัพธ์
ถ้าไม่มี branch นี้: agent เขียน trail เฉพาะตอนที่จำได้
```

### 4. Kiro MCP Servers

**Kiro ให้อะไร.** คุณประกาศ external tool server (Slack, Jira, GitHub) ใน agent
config `mcpServers`. agent query มันได้.

**main branch ทำอะไร.** skill `/why` บอกว่า "discover MCPs จาก Cursor environment"
ซึ่งไม่มีความหมายบน Kiro.

**branch นี้ทำอะไร.** `/why` อ่าน MCP servers จาก Kiro agent config แล้ว query
แต่ละแหล่งเพื่อหาหลักฐาน.

**ตัวอย่าง flow.**
```
คุณมี:    mcpServers ที่ตั้ง GitHub ไว้ใน agent
คุณพิมพ์:  /why was the per-request DB connection chosen
agent ทำ:  query git history ผ่าน GitHub MCP, หา commit, อ้าง PR discussion
ถ้าไม่มี branch นี้: prose บอก "inspect the mcps/ directory Cursor exposes" agent งง
```

### 5. Model default ที่ใช้งานได้ทันที

**Kiro ให้อะไร.** Auto model selection. คุณเลือก model หรือให้ Kiro เลือก.

**main branch ทำอะไร.** บาง runner skill ยังมีชื่อ model ของ Cursor เช่น
`grok-4.7-xhigh-fast`. Kiro ไม่รู้จักชื่อพวกนี้. ถ้ารัน `/how` หรือ `/arena` ก่อน
`/setup-pstack` การ spawn subagent จะ fail ด้วย error model-rejected.

**branch นี้ทำอะไร.** ทุก skill default เป็น `auto` (ใช้ model ของแชตหลัก). ใช้งาน
ได้ทันทีหลังติดตั้ง. `/setup-pstack` ให้ pin model ทีหลังได้ถ้าต้องการ.

## เทียบสั้นๆ

| | branch `main` | branch `kiro-core-feature-integration` |
|---|---|---|
| Specs | ไม่สนใจ | อ่านก่อนวางแผน acceptance criteria = done-check |
| Steering | เข้า context เงียบๆ | skill บอกชื่อและทำตาม convention |
| Hooks | decision trail ด้วยมือ | Stop-hook trail อัตโนมัติ |
| MCP | prose discovery ของ Cursor | อ่าน Kiro agent config |
| Model default | Cursor slug ที่อาจ reject | `auto` ทุกที่ ใช้ได้ทันที |
| Cursor-ism cleanup | core loop เท่านั้น | ลึก ทั้ง 51 skills |

รายละเอียดการเปลี่ยนทุกไฟล์และผล verification อยู่ใน
[`docs/KIRO-INTEGRATION-REPORT.md`](docs/KIRO-INTEGRATION-REPORT.md). คู่มือใช้งาน
ทั้งห้า feature อยู่ใน
[`docs/guide/11-kiro-integration.md`](docs/guide/11-kiro-integration.md).

## pstack คืออะไร

pstack เป็น agent operating system แบบ structured. `/poteto-mode` เป็น router.
คุณให้งานมัน มัน match playbook, ใช้ principles, delegate ผ่าน subagents, และเขียน
งานที่ verify แล้ว. มี 51 skills, 23 playbooks, 24 principles.

## ติดตั้ง

```bash
git clone https://github.com/auaii/Pstack-kiro-harness.git
cd Pstack-kiro-harness
git checkout kiro-core-feature-integration
chmod +x install.sh
./install.sh global
```

copy ทุก skill ไป `~/.kiro/skills/` และ agent config ไป `~/.kiro/agents/`, validate,
แล้วรัน harness. ติดตั้งแบบ workspace ด้วย `./install.sh workspace` วางใต้โปรเจกต์แทน.

## ใช้งาน

pstack skills ทำงานเป็น slash command ใน `kiro-cli chat`. หลังติดตั้ง global ทุก
session เห็น skill ทั้งหมดเพราะ default agent inherit `skill://~/.kiro/skills/*/SKILL.md`.

```
/poteto-mode <งานของคุณ>      # router เลือก playbook แล้วทำ
/how <subsystem>              # อธิบายว่าทำงานยังไง
/why <decision>               # ทำไมถึงทำแบบนี้
/setup-pstack                 # เลือก model ต่อ role
```

ดู [`docs/guide/`](docs/guide/) สำหรับคู่มือเต็ม 11 หน้า.
