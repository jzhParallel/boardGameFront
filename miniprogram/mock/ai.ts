/** AI 模拟回复数据 */

interface AiReply {
  keywords: string[]
  reply: string
  game?: { name: string; players: string; difficulty: number }
}

const replies: AiReply[] = [
  {
    keywords: ['卡坦岛', '怎么玩'],
    reply: '卡坦岛是一款经典的策略桌游！\n\n基本规则：\n1. 玩家通过掷骰子获取资源（木材、砖块、矿石、麦子、羊毛）\n2. 用资源建造道路、定居点和城市\n3. 定居点得1分，城市得2分，最先达到10分的玩家获胜\n4. 可以和其他玩家交易资源\n\n小提示：注意观察骰子概率，选择高产出的位置建造定居点哦！',
    game: { name: '卡坦岛', players: '3-4人', difficulty: 3 },
  },
  {
    keywords: ['狼人杀', '怎么玩'],
    reply: '狼人杀是一款超好玩的推理派对游戏！\n\n基本规则：\n1. 每人抽取身份牌（狼人/村民/神职）\n2. 夜晚：狼人选择击杀目标，神职执行技能\n3. 白天：所有人讨论并投票放逐嫌疑人\n4. 狼人全部出局则好人胜，好人数量≤狼人则狼人胜\n\n关键技巧：观察发言逻辑，注意微表情，大胆推理！',
    game: { name: '狼人杀', players: '8-18人', difficulty: 2 },
  },
  {
    keywords: ['推荐', '玩什么', '有什么'],
    reply: '根据你们的情况，我推荐几款热门桌游：\n\n🎯 策略类：卡坦岛、璀璨宝石\n🎉 派对类：狼人杀、谁是卧底\n🔍 推理类：阿瓦隆、妙探寻凶\n🤝 合作类：瘟疫危机、花火\n\n告诉我你们的人数和偏好，我可以更精准推荐哦！',
    game: { name: '璀璨宝石', players: '2-4人', difficulty: 2 },
  },
  {
    keywords: ['阿瓦隆', '怎么玩'],
    reply: '阿瓦隆是一款精彩的阵营推理游戏！\n\n基本规则：\n1. 分为好人阵营（亚瑟的忠臣）和坏人阵营（莫德雷德的爪牙）\n2. 每轮由队长组队执行任务，全员投票决定是否通过\n3. 任务需要多数赞成票才能出发\n4. 出发的队员秘密投出成功/失败\n5. 5轮任务中，好人赢3轮则好人胜\n\n精髓：隐藏身份、读懂他人、建立信任！',
    game: { name: '阿瓦隆', players: '5-10人', difficulty: 3 },
  },
]

const defaultReply: AiReply = {
  keywords: [],
  reply: '你好！我是桌游小助手 🎲\n\n我可以帮你：\n• 解答桌游规则\n• 推荐适合的桌游\n• 告诉你桌游在店里的位置\n\n试着问我"卡坦岛怎么玩"或"推荐几款桌游"吧！\n\n（AI解答仅供参考，具体规则以店内说明为准）',
}

/** 根据用户输入获取模拟回复 */
export function getAiReply(input: string): AiReply {
  const lower = input.toLowerCase()
  for (const r of replies) {
    if (r.keywords.some(k => lower.includes(k))) {
      return r
    }
  }
  return defaultReply
}

/** 模拟流式输出，返回定时器ID */
export function streamReply(
  fullText: string,
  onChunk: (partial: string) => void,
  onDone: () => void,
  speed = 50
): number {
  let index = 0
  const timer = setInterval(() => {
    index += 2 // 每次输出2个字符
    if (index >= fullText.length) {
      onChunk(fullText)
      clearInterval(timer)
      onDone()
    } else {
      onChunk(fullText.substring(0, index))
    }
  }, speed) as unknown as number
  return timer
}
