import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, MoreHorizontal, Filter, Grid, FileText, 
  MoreVertical, Plus, ChevronLeft, Inbox, Book, Settings, Trash2, X,
  Clock, CheckSquare, Copy, FolderPlus, FolderMinus, Share, Check,
  PlaySquare, ImageIcon, Link2, Mic, Pencil, Sparkles, RefreshCw, ArrowLeft,
  Link as LinkIcon, Loader2, Bookmark, ChevronDown, Zap
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { Note, Notebook } from './types';
import TagEditorPanel from './components/TagEditorPanel';
import VoiceRecordingPanel from './components/VoiceRecordingPanel';

const NOTEBOOK_COLORS = ['#E5E7EB', '#F5E6E6', '#E6F5E9', '#E6EEF5', '#F5E6F0', '#F5F0E6'];

const FALLBACK_QUOTES = [
  {
    text: "好记性不如烂笔头，记录是思考的延续。",
    source: "笔记心得",
    date: new Date().toLocaleDateString().replace(/\//g, '.'),
    highlightedWords: ["烂笔头", "思考"],
    highlightColor: "text-gray-900"
  },
  {
    text: "温故而知新，可以为师矣。定期回顾你的笔记。",
    source: "论语",
    date: new Date().toLocaleDateString().replace(/\//g, '.'),
    highlightedWords: ["温故而知新"],
    highlightColor: "text-gray-900"
  },
  {
    text: "灵感转瞬即逝，唯有记录永恒。",
    source: "创作指南",
    date: new Date().toLocaleDateString().replace(/\//g, '.'),
    highlightedWords: ["灵感", "永恒"],
    highlightColor: "text-gray-900"
  }
];

const INITIAL_NOTEBOOKS: Notebook[] = [
  { id: '1', name: '产品洞察与思考', updatedAt: Date.now() - 86400000, createdAt: Date.now() - 86400000 },
];

const INITIAL_NOTES: Note[] = [
  {
    id: '101',
    title: '打苹果软肋：设计风格与人群定位',
    content: '和友商竞争，荣耀、小米，男性打参数内卷。我们要找到自己的优势，女性用户多。持续保温，R系列的打法靠终端销售。产品的节奏不一样，按照一年一代的发布，终端促销员不太会卖高端机，消费者主动到店里问。\n\n中国大陆二线以上的，年轻人体。人群定义本身在变化，追求年轻，但不幽林。35-45还是中青年，25-35是青年。\n\n虚拟人物做的更高一些。和find 人群还是有一定不一样，购买力更强一些。画像很重要，画像还会继续调整。买标准版和Pro版的人群定位是颠倒的，品质生活是Pro，自我实现是标准版。规格设计上也会根据这个做出区隔。\n\n9号PRo，17是标准版。都市中青年，36-45年龄。左边8号购买力更强。\n\nFind X、N、flod、filp之间又有什么价值区隔？现在偏findX的人群画像。FInd N上什么人群画像，上下折打的是美图手机用户，追求时尚，网络打卡的用户。价格比较高，和Reno不太一样，一线女性、爱拍照、爱美的。苹果朴实不维护。人群画像要再看一下。',
    tags: ['产品策略', '人群画像', '竞品分析'],
    notebookId: '1',
    updatedAt: new Date('2026-03-25T10:00:00').getTime(),
    createdAt: new Date('2026-03-25T10:00:00').getTime(),
    createDevice: 'iPhone 15 Pro',
    updateDevice: 'MacBook Pro',
    audioDuration: '45:12',
  },
  {
    id: '102',
    title: 'FInd 的人群系统思考：高端全景与软硬结合',
    content: '定义低端产品，消费者在买。要买就买值得买。把OPPO品牌形象体现出来。如果OPPO不提供好的产品，安卓只能越来越硬，柔软打情感的产品，把苹果用户转移过来。\n\n1.如何理解技术，把技术优势转化为用户语言，是非常有优势的地方，产品经理大多设计用户有交互的产品的设计，但是基础体验的技术原理和用户角度的理解都比较欠缺。\n2.市场上硬件的内卷已经非常极致，如何做到软硬结合的体验，使得一加一大于2，是很好的切入点，像iphone 的灵动岛，让硬件的设计与软件交互几乎完美的结合，成为让大家眼前一亮的东西，是软件赋能硬件，同时也能让用户买单的很好例子，需要我们挖掘一些软硬结合的特性。硬件在终端是非常好演示的，比如悬停、前后屏的拍照，建议也可以多从软硬结合的点上进行思考。\n3.思考从不同系列，不同品牌的高端系列观察是非常好的洞察，可以进一步看为什么这些卖点打动用户，高端用户的画像是什么样的，有些功能是科技力、或者身份的象征，有些功能是对用户的生活场景有帮助，有些是提升效率，可以设想这些卖点的对于这部分人群背后的原因，真正打动用户的是什么场景什么服务。基于设想可以多和用户聊一聊他们日常的一些使用场景。\n4.最近识屏的听歌识曲功能出了点问题（预计9月底会重新上架)\n5.最后反内卷斗士加油！！！\n\n1.营业厅用户一帮是受到话费充值的优惠，手机购买的转化率会比较高，一般硬件都差不多，主要是导购引导就决策了一台手机。建议如果在购机时用户对品牌或者软件感知不强，可以在用户手机搬家过程中，问问用户的使用习惯和一些使用场景，一般使用手机都干什么，希望手机有什么功能，都可以聊一聊。用户不一定对OPPO手机的一些功能很了解，但是能聊一聊用户和手机的生活，对用户的理解更深画像了解更多，都是对后续做产品的帮助，比如能有更多的视角告诉自己用户是多样性的，从而避免进入自己的思维范式里。不用给自己太多的压力或者目标一定要了解和软件相关的内容。线下用户购机环节，是产品和用户建立联系的一种方式，随便聊一聊多认识不同种人是如何看待手机的，也是很大的收获\n2.发现功能组件的视觉优化，能说明你非常贴心，虽然交互在设计负责，能帮助交互导入用户视角的意见，给出产品基于用户的思考，会帮助你对交互的理解。也帮助交互平衡美观性和实用性。\n3.防窥模式，目前没有特别好的解决方案，屏幕现在往高分辨率(PPI）、高亮度(nit）的方向发展，防窥膜一定层度上是牺牲了亮度，还不能帮助我们提升屏幕分辩率，成本上还增加了不少。这个诉求是不是大众需求，用户是否会愿意花更多的钱买单这个产品是需要思考的。我理解真伪需求，是有多少用户愿意花超过这些成本的价格获得这样的产品。如果收益带来是正的，那么就是个真需求。这也是后面做kano测试要注意的地方，一个用户不考虑花钱的新功能，问用户吸引力，往往都是能得到一个正反馈',
    tags: ['高端市场', '软硬结合', '用户调研'],
    notebookId: '1',
    updatedAt: new Date('2026-03-25T11:30:00').getTime(),
    createdAt: new Date('2026-03-25T11:30:00').getTime(),
    createDevice: 'MacBook Pro',
    updateDevice: 'MacBook Pro',
    images: ['img1', 'img2'],
  },
  {
    id: '103',
    title: '折叠屏口袋生产力：长期演进赛道共识',
    content: '共识：口袋生产力是折叠上软件的长期演进赛道\n在软件生产力赛道的拆解：信息采集、内容创作、多任务管理、协作共享、文件管理五大赛道是在生产力上共识的拆解逻辑，在软工内部会长期以该逻辑进行演进不会变更\n在整机生产力赛道的拆解：基于5大赛道，从用户痛点、iPad演进梳理后聚焦到最有价值的几个点，并几点内部有逻辑支撑。在下周前与Andy和产品线完成共识—-Seven(7月1号前)\n折叠机的优先级三大原则：①折叠机强相关、②技术可演进、③营销可传播(含用户高频使用)\n\nHaydon: OS的价值是习惯数据的沉淀。口袋生产力方向是长期形成的认知，很难在短期做出口袋生产力的认知。悬停不建议作为长期特性，只是带来交互便利，用户使用时长低，目前仅是有营销价值。多任务管理，作为应用高效切换可以长期做。生产力最极致的设备是PC，PC作为生产力的优势是(屏幕大(多任务)、内存大(文件管理)、应用丰富、鼠标（交互))，OS生产力演进的方向是朝着PC的能力发展。关于PaperOS从OS变革趋势给的建议:OS的交互发展一般分为两个方向，第一个方向是移动侧桌面笔记本的方向。第二个方向是当触控交互、显示方式发生变化，才会出现新的桌面形式，一般取决于显示材料发生变化（如AR、VR的出现）。\n\nSeven: 整机赛道，会从用户痛点、iPad演进梳理后聚焦到最有价值的几个点。并且几点之间是有逻辑支撑。\n\n周意保: 整机三个赛道的逻辑：降摩擦(轻薄)、新价值(生产力)、传统赛道（影像)。当前赛道中，口袋生产力的文件的编管传看，较其他两个赛道没有差异化亮点支撑。大屏除了像看邮件场景更优的体验，在iPad上还产生了从无到有的功能，如用笔创作画图，从iPad前5代以上的发布会分析，我们折叠生产力的赛道是什么。\n\nAndy: 悬停类似PC形态，从短期看，用户使用人数不多但是在营销上确实可以给用户建立很强的折叠认知，从中场期看，悬停是。界面的重构是否是生产力的一部分。当前只是直板机的交互简单复用在大屏。机会点是否是大屏的交互体验在折叠机体验到。优先级的逻辑和原则。\n\nG：成功时的样子是iPadOS，赛道之一可能是：互联。大屏、折叠。以平板为中心，包含折叠场景。同时做好沉浸式生产力。我们的优势轻便+强操作体验。\n\n海舟：Paper OS是有能力引领生产力的概念，当前信息流程的处理的五大赛道是我们能在生产力赛道做到70分的能力。在中长期和短期的区别。',
    tags: ['折叠屏', '生产力', '会议记录'],
    notebookId: '1',
    updatedAt: new Date('2026-03-25T14:00:00').getTime(),
    createdAt: new Date('2026-03-25T14:00:00').getTime(),
    createDevice: 'iPad Pro',
    updateDevice: 'iPad Pro',
    audioDuration: '1:25:04',
  },
  {
    id: '104',
    title: '直板机5大赛道梳理：影像、屏幕、系统、性能、外观',
    content: '照直板机5大赛道，影像、屏幕、系统、性能、外观。按照这五个方向梳理一下\n1.外观，定义的前端思考、后期的打磨思考是什么。前端作为影像旗舰产品，影像外观不够大气。表达功能并升华功能，把拍照感觉显得专业和大气不显性。X5标准版，下面妥协了很多设计，不完全一致，导致ID体验显得特点不突出不大气。\n2.拍照，定义端有哪些问题，核心在行业里面，买了之后的认知，心里有落差，买后的推荐定义规划的不足、实现的不足、打磨的不足。\n3.影像长版，长焦的缺失，用户心理Gap，前端没有定义好。定义好的马里亚纳、双欧没有做好没有打磨好的问题。定义的问题是产品端解决，实现打磨端是研发要解决的问题。实际拍照基本面，未来怎么做，客观指标、 体验指标逻辑建立起来。定义问题实现问题，下一步要改善的问题\n4.屏幕，上面是沿用，数字系列选型问题，选屏幕排列组合、视角问题，定义不够，屏显专家在定义中的价值体现。出来问题都有责任，都是产品定义的问题。排列问题讲清楚。',
    tags: ['直板机', '产品定义', '复盘'],
    notebookId: null,
    updatedAt: new Date('2026-03-25T15:30:00').getTime(),
    createdAt: new Date('2026-03-25T15:30:00').getTime(),
    createDevice: 'iPhone 15 Pro',
    updateDevice: 'iPhone 15 Pro',
  },
  {
    id: '105',
    title: '折叠屏体验衡量标准与DXO',
    content: '1.口袋生产力特性价值衡量，可以考虑增加“可大可小，可弯可折的体验”打分，避免大屏体验就代表了折叠体验。大屏并不一定都是优势，大屏会带来不便的原因，反而不太普及。折叠相关的体验不只是大屏，还包含有折叠、开合、不同屏幕比例（方屏、4：3等不同比例）等仅折叠屏能带来的体验。可以考虑在软硬结合的体验中，与折叠相关的特性，权重分别占什么，衡量维度的打分规则是否需要在折叠相关的点增加权重。\n\n2.软件体验偏主观，需要建立折叠DXO的衡量标准，并不断斟酌衡量标准的量化指标。在折叠交互上建立行业共识和标准，要从外部看竞争对手、用户的视角看衡量维度的规则。用户视角：标准能更客观，更触动用户，为什么不买平板买折叠机，折叠产品好在哪里，折叠机给他带来什么样的体验。竞争对手：逻辑自洽，同行看也大致挑不出问题的标准。可以衡量出更好的软件交互，通过这个标准能够牵引我们做生产力第一的点有些。怎么做到比竞品好，能把竞品拉到一起对标，我们凭什么卖的更好。衡量标准中可以增加的点：用户使用的高频、帮助专业人士提高效率等维度。更仔细斟酌标准的指标：在折叠整个交互在行业没有共识的现状，我们是向着同行都认可的标准努力，打分的标准需要认可度高，能代表折叠行业主观体验客观化很好的参考。并且指标不只是软件，而是要完整诠释什么是好折叠，能让重要KOL按照这个标准来测。例如：含折痕、防沙尘、软件主观体验的量化。行业折叠DXO的制定对营销PR稿的优势，通过DXO效果评测，我们发布营销PR搞，就可以拿对手对比说明。',
    tags: ['折叠屏', '体验标准', 'DXO'],
    notebookId: null,
    updatedAt: new Date('2026-03-25T16:45:00').getTime(),
    createdAt: new Date('2026-03-25T16:45:00').getTime(),
    createDevice: 'MacBook Pro',
    updateDevice: 'MacBook Pro',
    link: {
      source: '内部文档',
      url: 'docs.internal.com/foldable-dxo'
    }
  },
  {
    id: '106',
    title: '白天鹅重点突破与悬停模式思考',
    content: '3.确定白天鹅重点突破：桌面文件袋，单应用双开。在对功能调研中，目前均是使用用户可交互可体验的原型，避免在调研里用户对看不见的功能做评价，调研产生偏差。分屏传送门。多应用一个界面解决问题，左边拍照，右边直接插入PPT。该特性技术存在可行性问题，需要进一步拆解功能点，保证部分场景和功能的实现。研发资源的提前锁定。确定三方合作的资源投入，如微信、WPS的合作。当前两大特性共识后，下一步要看资源和实现方案，如果不能完全支撑，要看有哪些点可以拆出来看。\n\n4.悬停模式需要在生产力上特别关注。当前确定了“上看下用”的长期演进路线。在口袋生产力上悬停聚焦在办公会议场景。同时整体折叠在悬停赛道会持续演进。悬停功能是与折叠本身相关的体验，并且左右、上下折共有的特性。悬停和生产力从形态上有相关性，表现在笔记本都是另外一种悬停表现，Macbook在操作区增加了小的触控窗口，提供了独一无二的体验，并且有高级感。我们的折叠悬停模式是和生产力最相关的形态，并且比传统的生产力工具电脑相比上下都可触，需要特别关注。\n\n5.软件功能需要放大硬件的价值。需要对硬件和软件结合思考。要达成的效果是，硬件多花的100块钱的器件，通过软件设计放大成1000块钱的效果。从而把硬件价值发挥最大化。硬件成为用户为之买单的核心点，最后效果通过软件设计做到足够好。我们不是互联网公司，不是从纯软的角度去设计功能，我们给用户提供软硬结合的感受才是有价值的，用户是买的硬件，每个关键的器件是思考的输入，器件的价值通过软件放大。\n\n6.增加对娱乐场景的优化，要考虑到“买前生产力，买后爱奇艺”的用户本性',
    tags: ['白天鹅', '悬停模式', '软硬结合'],
    notebookId: null,
    updatedAt: new Date('2026-03-26T09:15:00').getTime(),
    createdAt: new Date('2026-03-26T09:15:00').getTime(),
    createDevice: 'iPhone 15 Pro',
    updateDevice: 'MacBook Pro',
    images: ['img3'],
  },
  {
    id: '107',
    title: '折叠first打透：引领者与商业价值',
    content: '折叠first打透，折叠机领域的引领者。引领技术突破，关键产品特性的承载，市场的普及。OPPO很多用户是有文艺追求，早期很多无论是find气质感，科技和艺术很好的结合，手机本身是科技产品，科技产品给科技人做是小众，不具有普适性，线上的产品就是这样，科技与艺术结合，就有人性化和温暖的东西，FindN系列大方向还是偏科技时尚去做，体质内的人，偏沉稳的商务风，品牌的实际感觉去撬动这部分人群，不是最好的感觉，品牌积淀和第一印象是什么，用户规模足够大和多，很多群体就会被辐射，find N系列就是这个方向，特别是上下折，和Ulike人群可能是一致。产品本身要在轻薄上的。\n\n口袋生产力，依赖软件体验，分解清楚。无论是轻薄还是口袋生产力，产品对用户洞察和技术要求很高，做哪些产品特性，关键特性去做，哪些技术创新支撑这两项，产品经理，在产品中遇到什么问题，需要技术提前跑出来。这个需要整机和各个模块的了解，硬件有哪些模块，软件有哪些模块。人人都想打造浪漫科技的产品——科技与艺术的结合。产品定位是离不开的原点，一直以来成功的因子是什么，这么多品牌利用优势，产品往往在市场上很别扭。产品规模足够大，有更多特性会体现出来，特别是突破性产品，原始的内涵和原点人群从这里入手。\n\n前端战略和策略的思考，针对用户机会，清晰的策略和清晰的Top3的主张是什么。怎么界定。高端用户高频高投入产品经理反复想，什么是高端、高频高投入，整机产品经理要考虑商业，投入产出，产品不知道需要多少人、月去干什么。Bom成本高，现在看特别是整机，把很多工作重点放到投入产出里面，算多少账，X5用了双O没讲是产品问题，整机产品经理需要站在用户角度做价值判断和商业判断。\n\n硬工影像产品和软工的产品是专业价值和用户价值。与整机商业价值和用户价值存在冲突，整机整体商业价值的成功，怎么成功，手机不是器件整合，整机结构化成本布局对整机的成功很重要。R系列定义一个东西，被提前暴露出来，罚2千w，整个安卓市场都在打名牌，所以行业在打名牌，商业成本组合策略，不断推演和演算比软件特性重要的多。\n\nFind X打影像旗舰不是打功能就是打效果，产品经理效果没有达预期就要及时报警。这些工作量很大，这样的产品效果，几十个上百个场景打一个特性，很重要的是看商业价值，投入产出价值，保证产品特性打赢。软性特性，真正的特性软硬结合、与屏幕、平台结合，需要整机产品经理结合，软件产品偏软硬结合，钱花到哪里，投入重金在市场上必须打赢，不是定义完就完事，定义重点投资的点，拉研发做好，才是整机产品做好的感觉。如果硬件，私密通话，硬件投钱了，软件不会有主动思考，投了钱就要做出来，软件产品经理可以不需要硬件投资组合的就可以交给软件产品经理。\n\n组织互相信任。这一次复盘为什么没有做成，X6要通过PDT和产品经理团队手把手确保定义的特性必须达成。产品线pDT很重要，硬工软工是蒙着眼睛走路，产品线是睁着眼睛走。产品线带他们去不确定的不确定中去，产品线的产品经理和PDT经理需要干的。\n\n和战规出一些原则，决策有哪些因子：呆滞料、关键器件选型：成本、研发、进度、资源投入，哪些因素定了不会有太多疑问，哪些成本超过多少人天要上升PSC。产品线要建立常规的决策机制，我们要遵守规则，尽量定的规则少一些，规范化运作起来。共识分层分级的依据。关键器件：平台、摄像头、屏、充电，在PSC（产品战略委员会）产品选型在18月规划之内就在PLPAC。如果不在18月规划在PSC（变更规划）。器件规划：其他在器件规划，经营成功还是PLPAC。本来分层分级，个别角色不在PSC、PLPAC体系内，只有建议权如CPO。导致变更紧急的，需要临时召开PLPAC，线下所有是沟通建议，正式以PLPAC会议为准。PSC MO会签\n\n产品延续性，没有上下代的理解都会出现偏差，FindX系列整体看起来。X5的复盘一起看护起来，看到问题才知道对不对，问题反复看吸取经验和教训。产品主张是否有延续性，一定有主张。Find X系列，每一代产品都是变更。折叠问题，下一代折叠规划，大家一起把产品全生命周期定义。',
    tags: ['折叠屏', '战略规划', '商业价值'],
    notebookId: null,
    updatedAt: new Date('2026-03-26T10:20:00').getTime(),
    createdAt: new Date('2026-03-26T10:20:00').getTime(),
    createDevice: 'MacBook Pro',
    updateDevice: 'MacBook Pro',
    audioDuration: '52:18',
  },
  {
    id: '108',
    title: '寻找感性人群与高端女性用户抓取',
    content: '到三十岁这一部分人，他最后不一定买我们的产品，要么购买力不强，要么购买力很强买iphone。对这部分人购买力很强的年轻人，他们买东西可能也不思考打折，但是因为我们的品牌力还没有到那个程度，往往是那种三十五岁——四十五岁之间的那些人，对oppo 还是有一些认知的，思考让我们的产品的一个点能真正打动他。\n\n2.找到感性人群\n促销期买戴森的人群，他可能是非常懂产品但是又很理性，感觉不是我们要找的人群，这部分人群他偏理性也还会追求性价比，最后会变成一加的人群，买个配置不错，还比OPPO省1千，因为懂产品，又划算就会买一加的产品，这类应该属于电商产品的人群。find系列如果打这波人群会导致我们成本压力很大，最后还是觉得我们贵，就没有机会做好。奋进青年事业处于上升期，他有些时候买一些东西的时候，他其实还是会舍不得买一些东西。但是35岁左右，事业稳定期购买力比较强的那些人群。他只要产品好，他就会去买。他不会是一定等促销期再买东西。我们oppo 的产品需要找一些感性人群。品牌特征里面有很多感性成分，会因为这种情感而愿意买单对价格成本没有那么敏感，像是他是因为戴森这个产品好，就直接下单，而不会去等促销期。\n对标iphone 和p 系列，想要打造一个拍照很好体验很好，又具有设计感的产品。在X6这一代，真正的要找到我们到底打什么人群。我们要打的那些人群是他看我们的产品觉得便宜的那些人群是什么。极端一些像买香奈儿、Gucci这些产品，他买六七千块钱手机就不是问题。\n\n高端女性的抓取弱的问题。\n女性用户多了，就有规模效应。因为女性传播比男性传播要更快更强一些。女性愿意跟别人交流和推荐。京东调查数据显示，与竞品对比我们在高端女性的抓取能力弱，后续基于各层面的一些研究进行综合分析。\n\n与X6产品团队探讨iPhone用户人群中可以转移到OPPO的人群定义，把人群地图梳理清楚——3月内与产品线人群地图梳理，找准人群。\n我们不要认为那些感性人群一定会买iphone。如果我们的产品定义到位，满足他的需求并且真正能打动他，与iphone 做出差异化的体验，他反而就容易转移到我们这边来。我们现在定义的这些人，iphone 在他印象中已经是根深蒂固了。他花五六千块钱买iphone，就觉得还好，但是他花五六千块钱买oppo，他就觉得贵了。并且有一部分人会认为拍照很好，然后外观也都不错。那为什么一定要用iphone 呢？\n\n不同年龄段，越高端的产品设计更偏向经典、简约，其实不应该有太多的个性，但是不是稳重老气的感觉，要让他拿到手里是经典精致不失身份也不觉得尴尬。人群一旦描述正确了，我们产品里面很多的设计都要往这样的人群特征去做，营销打的人群他也能打对，传播哪些渠道也能找准。\n如果我们人群没有定义清楚，我们最终卖多少量，就变成了一个听天由命的感觉了，现在在一些链路上面没有形成一个就是有机的整体。我们现在就要真正的找准洞察到那个人群，从传播的方向，产品的定义，以及最后真正打动他的特性全都是一套。然后最后发现你所有的人群里面购买比例正好是定位的人群是最高的。然后慢慢形成规模，再去对其他类别辐射。\n\n寻找目标人群访谈\n追求自我愉悦的都市白领人群，这部分人群无论是用苹果的还是华为的手机，了解他们在使用华为、苹果拍照上的爽点，遇到什么样的痛点，把好和不好的地方整理起来。这样的话，我们能更精准的定义产品。——3月24号高端用户影像洞察报告分享\n\niPhone人群\n我们以前做高端一直不敢突破iPhone人群，基本放弃了这部分人群。这可能是个误区。可以围绕这些用户找他们在拍照上的一些特点。是不是是女性的，还是中性，到时候看一下，至少还是要以这种类似的感觉去找。',
    tags: ['人群画像', '高端市场', '女性用户'],
    notebookId: null,
    updatedAt: new Date('2026-03-26T11:45:00').getTime(),
    createdAt: new Date('2026-03-26T11:45:00').getTime(),
    createDevice: 'iPad Pro',
    updateDevice: 'iPad Pro',
  },
  {
    id: '109',
    title: '智慧生活与泛在服务架构思考',
    content: '大的方向讲智慧生活，四大智慧主题公司级统一梳理出来，互联互通原来是个主线，现在是支撑各种场景的能力，必须有场景化的思考，Alex和裴润生，能力构建，核心打造的技术架构是什么，未来战略控制点要能抓出来。\n主线2.0沟通，和他们沟通，互联互通要有场景化思考\n架构的战略控制点要思考出来，每一项支撑的场景是否有通用性的。\n泛在服务，分布式的能力，和未来的关联是什么，是互补、叠加、互斥都要考虑清楚。\n场景会导致做的很散做牛毛。\n基于场景化思考共性的东西，技术架构核心控制点。\n关键支撑里面，技术规划正在做的。\n\n和IoT的连接\n耳机暂停播放，暂停后，继续播放，会换成其他应用的播放声音。\n专项打通大投，基础体验打好。\n核心的连接体验，就那些感觉不是很舒服的地方提取出来做透。\n\n连接体验专项是塔底',
    tags: ['智慧生活', '互联互通', '技术架构'],
    notebookId: null,
    updatedAt: new Date('2026-03-26T14:10:00').getTime(),
    createdAt: new Date('2026-03-26T14:10:00').getTime(),
    createDevice: 'iPhone 15 Pro',
    updateDevice: 'iPhone 15 Pro',
    link: {
      source: '内部维基',
      url: 'wiki.internal.com/smart-life-arch'
    }
  },
  {
    id: '110',
    title: '苹果文化与OPPO文化的对比与反思',
    content: '坚持坦率和韧性\nPPT汇报和梳理，但是整理过程中，更好帮助自己理解产品\n不应该以工程师的思维做presentation，要和家里不懂的人阐述，让大家都能理解\n数据依赖\n基础研发和产品设计用数据驱动上，会花费很多时间，做产品调研和论文，获取数据。\n数据的可信，专利、和\n很多专利是因为技术不成熟\n对于论文，很多数据不是和预想产生是不一样的\n算法和功能上开发，不仅是大量数据的支持开发，考虑各种极端的情况、前期通过数据思考能避免没有思考到的地方。\n为扩展和后续做计划\n音频耳机相关的健康功能讨论上面，苹果的Airpods在推出有很多传感器，硬件堆叠，但是没有任何功能实现，1年后推出空间音频。\n未来可能规划的功能和算法。\n产品经常考虑成本，但是也要考虑技术的长线布局，在未来提升功能和性能\n最近的几代IPhone都有Lidar Scanner，但是苹果在做AR、VR长线布局，让过去几代的产品都能实现，为未来技术实现在已有的产品上更好的实现功能。\n吸引，发展并且分享人才\n挖走其他团队的成员，管理者不应该生气，要分享人才\n承担艰难的决定\n非常注重勇于承担，我们的文化不鼓励承担，反而干不好会罚绩效分，不犯错，怎么创新。Face ID，结构光传感器相关，在指纹和Face ID做选择，做屏下指纹，苹果对屏幕要求非常高，屏下指纹风险很高，他当时Own Face ID，用Deep Learning搞定了face ID。\n避免模棱两可\n给团队和项目做决策和讨论，很难量化和简单的指令，登月的例子，我们举全国之力，（谁)时间十年之内（时间）把一个人安全的送到月球并且安全送回地球（干什么)\n公司和项目团队把持创业公司的风格\n不一定是没钱、熬夜、公司小，而是和团队争辩讲道理(十二怒汉)\n平时在讨论项目和技术产品开发，要尽全力前提是做足功课，并且观点是对的。\n不管团队多小多差，全力以赴把产品做好\n追求完美\nPPT花时间太多不倡导\n把它打造出来\n评价机制\n在苹果没有KPI.只看results-innvation\nteamwork\n苹果鼓励创新：在领域里面做新的尝试，把创新植入到日常工作中。\n每家公司都是不同的\nOPPO: \n三星：硬件的属性，在硬件深耕和创新，苹果里三星的部件超过自己三星手机中的三星部件。\n苹果: \nendurance & enrichment\n让产品团队和工程技术团队有机结合\n多研究些问题，少谈论写主义\n日拱一卒无有尽，功不唐捐终入海\n苹果的文化和OPPO的文化有哪些：\n苹果从技术看，更多考虑如何比自己调优\nOPPO考虑怎么样和其他去做比较\nOPPO文化是本分文化，\n苹果的文化，对供应商会很严苛\n苹果没有产品经理，如何定义产品逻辑。\n苹果主要是硬件公司，驱动产品前进的是硬件团队，PD团队（结构工程师）\n讲逻辑和数据。\n苹果是否有目标用户',
    tags: ['企业文化', '产品哲学', '竞品分析'],
    notebookId: null,
    updatedAt: new Date('2026-03-26T15:40:00').getTime(),
    createdAt: new Date('2026-03-26T15:40:00').getTime(),
    createDevice: 'MacBook Pro',
    updateDevice: 'MacBook Pro',
  },
  {
    id: '111',
    title: 'OPPO手环使用初体验与产品思考',
    content: 'OPPO手环的使用初体验\n感谢华仔不远千里捎了个OPPO手环给我，这几天半深度使用了一下，有一些基于用户的反馈，有很多可能是手环team已经思考过的或者不得以的选择，我还是整理了一些影响我无法持续佩戴使用的一些关键痛点，供参考。\n从一个非专业的手环产品经理视角出发，佩戴手环的目标用户需要进行运动或者生理状态的持续记录，并通过创新的数据分析模型和数据表现方式（包括推送策略）爽一下用户（工具属性），如果还能跟有些我想PK的人PK或者我想关心的人让我关心等（社交属性），那就太好了。这是两个宏观的方向，翻译到产品上，就是一方面硬件能不能持续不断的带在手上，另一方面软件能不能令我心动，用这两个可描述的方向可以指导一些细节上的思考，以下分析可能过去表面，不足之处见谅。\n\n硬件能不能持续佩戴\n1.1. 续航、充电方式的差异性和竞争力\n我充满电之后，开启了包括血氧记录（间隔）的所有功能，连续佩戴48小时之后剩余电量大概是40%，我们很容易追求的是续航，如果是这样，乍一看，好像这个数据还不错哦，三天才用充一次电。但从用户侧来看，这里面有几个真实需求，会让人用起来很烦躁，一秒钟的用户操作成本都是成本。\n持续佩戴，这是最关键的点，这跟下面的1.2也是一样，如果说手环跟手表最大的不一样，就是既能在白天连续帮我记录运动，又能在睡眠时帮我连续记录健康状态，连续的解读应该是如果用户觉得不必要的时候，都不用摘下来，这样才是真连续，这是最容易也最应该跟手表拉开差距的地方。如果追求的是一直佩戴，除了1.3里面的部分，就是续航和充电方式的挑战，在使用OPPO手环感觉续航还好之后，充电方式的痛就很明显了，即使2-3天取下来一次充电，这个频次已经够高了，我们感受一下整个充电过程：艰难打开带子卡扣-使劲向下扣下来部件-找到非标充电线-使劲把部件按进充电台-发现不充电并思考为啥呢-插拔充电USB检查之后发现都好的然后扣下来部件-哦发现原来反了电极在另一头-显示充电了放在了并思考把带子扔在哪儿不会明天找不到了-内心想惨了晚上我记录不了睡眠了-第二天一早忘了还有手环-下班回来找到部件扣下来-开始找带子发现咦我昨天就放在这个充电短短线旁边啊为什么不见了-发现是猫把它玩到了旁边的地上还好不是沙发下又不忍心为了手环打猫-把部件艰难的卡进带子-把带子艰难的卡扣扣上-28小时过后我的OPPO手环终于回到了我的手腕-心想下次充电怎么办啊。这可能是一个不熟练的手环用户的不熟练使用方式，但即使熟练手环用户都很有可能要失落的为了充电而选择放弃睡眠记录或者运动记录，但我们又凭什么要求用户熟练呢？\n既要考虑硬件的BOM成本，又要考虑续航，怎么能去最大限度的满足连续性，在非要不连续的时候，怎么降低用户的操作成本是个很关键的要求，我自己在取下手环的那个感受是APP安装-卸载-再安装的过程，类比这个来看，拉下载就很难，防卸载也很难，卸载后再拉安装更难。因此我们大胆假设一下，让用户把手环在手腕上安装之后，不卸载，不把手环取下来，这很难，但也许可以最大亮点的跟手表争夺这只手。在上面那种充电过程中，一个是用户不得不把整个手环拆解，很麻烦，第二是手环必须要离手，那是不是有可能不拆下来，让手环一直扣在手上，带子也不用拆，它只是需要一点儿电，那么我们电池这个模块有没有可能跟部件分离，同时电池的拆装是正面卡扣或者侧面抽插式的，直接给用户配置两颗电池，开模可能有难度，BOM成本也会增加一些，但可能能让我放心的一直带着，一颗在充电，一颗永远在手上。还要考虑的一点是拔下来的一小段时间，怎么低电量的让手环不停机，需要考量到，当然也可以重新装上时直接硬启动。\n这个太假设了，退一点儿的想法是怎么让拆下来之后至少方便一点，是否让部件的电极在两端，或者一个顶端，带子也有充电极并带着一个标准的充电口，至少我不用拆解手环就可以通过随便手边的一个充电线进行充电。\n另外一个细节是，表盘上显示电量是点击之后显示，但单击的主要操作不是用来看电量的，用户无法直观的知道当前电量情况，内心的不安全感会非常强，要知道自己安不安全又需要很高的操作成本，有点难过；怎么让用户便捷的知道当前电量，或者不让用户担心，直接估出相对准确的剩余可使用时间也许挺好。\n\n1.2. 手表与手环目标用户心智的争夺\n用户有两只手腕，OPPO自己也在做智能手表，那手表跟手环对用户心智来说是什么，这个领域我没深入思考过用户，通常用户应该有两个选择，一个是只单手佩戴一种产品，一个是双手各佩戴一种，我但直觉上是，两种产品很多功能有重复性，大概率用户应该选择前者，除了价格影响的用户分层外，对于两者的边缘用户的争夺，定位应该怎么思考，跟手表的最大差异点在哪儿，除了上面讲的可以不取下来，并且把血氧等全功能都打开之后的续航还很强之后，是什么可以让我不选择智能手表而选择手环的，甚至在我是一个手表用户的同时，能有什么让我愿意让我另一只手尝试着使用，并最后保持使用甚至两者相争留下来的是手环（当然，对于OPPO手表团队想的又是另外一回事儿，哈哈哈哈，不如寄一只手表让我看看他们是怎么竞争的）、或者两者都留下了。\n除了上面我自己有感触的可以让我一直戴着洗澡都不取下来让我有持续记录之后，我还没有体会到这样的点，但单纯这一点，又不足以支撑，下面要提到的两个点，也许可以思考。\n\n1.3. 佩戴舒适度与个性展示\n目前OPPO手环的核心部件的厚度相对还是大的，这样的佩戴舒适度一般，什么样的结构能让持续佩戴的感受更好可能可以考虑一下。更重要的一个点是，反正手表跟手链或者手串好像是没啥竞争的，但是手表跟手链结合做为首饰可能听起来就很蠢，毕竟手表追求的是功能更丰富，所以最多是表带的材质、颜色、图案等的一些差别。但手环能不能有一些手链给用户的追求，还是可以思考的，毕竟手环可以不像手表追求功能越多越好，而追求简单准确有效，那也许去替代一些特定人群的这种喜欢好像是有可能的。举个不恰当的例子，比如跳广场舞的阿姨们，她们各种各样的玉手环啥的都挺愿意带的，她们的健康也日日夜夜牵动孩子们的心，要是孩子们能买到一个高科技“玉”手环，送给他们，让他们持续带着，在跳舞的时候，向隔壁王大妈炫耀一下，并在她们可能发生一些可怕事件，比如“血氧”“严重”异常的时候，赶紧告诉下孩子。\n\n1.4. 关键工具属性的用户依赖度\n另外一个思考维度，对不同用户层，他们佩戴好手环后，除了时间、通知、天气等工具，还有用户日常需要的哪些工具性需求，可以提供给用户，这块儿可能会更难一些，但可以让除了记录之后，还有些让我离不开的理由。至少现在的手环，体会不到这点，但又觉得很必要。\n\n软件能不能令人心动\n还没有时间认真思考，等有时间了再想一下下面三个点，有没有比现在好的方式。\n2.1. 步数、心跳、血氧、体温的数据表现方式和展示或推送策略有哪些可以让用户真想洞察自己身体的。\n2.2. 某些能力上，我是否能立flag（比如早睡早起30天）让我的一些朋友来监督我，毕竟自律太难了，面子还是重要的；或者我是否能跟某些人PK，打赢还是爽的。\n2.3. 除了上面点对点的“用户交流”，还有没有些社交属性能让用户间相互爽一下的。',
    tags: ['产品体验', '智能穿戴', '用户痛点'],
    notebookId: null,
    updatedAt: new Date('2026-03-26T16:20:00').getTime(),
    createdAt: new Date('2026-03-26T16:20:00').getTime(),
    createDevice: 'iPhone 15 Pro',
    updateDevice: 'iPhone 15 Pro',
    images: ['img4', 'img5'],
  }
];

export default function App() {
  const [notebooks, setNotebooks] = useState<Notebook[]>(INITIAL_NOTEBOOKS);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  
  // Excerpt State
  const [quoteState, setQuoteState] = useState<{
    text: string;
    subtitle?: string;
    source?: string;
    date?: string;
    highlightedWords?: string[];
    highlightColor?: string;
    isGenerating: boolean;
  }>({
    text: "来都来了，记个东西\n万一有用呢",
    subtitle: "正在尝试摘录你曾经的笔记\n...",
    highlightColor: "text-gray-900",
    isGenerating: true
  });
  const [quoteHistory, setQuoteHistory] = useState<any[]>([]);
  const [isExcerptHistoryOpen, setIsExcerptHistoryOpen] = useState(false);

  // Typing Animation State
  const [displayText, setDisplayText] = useState(quoteState.text);
  const [isMetadataVisible, setIsMetadataVisible] = useState(true);
  const [displayMetadata, setDisplayMetadata] = useState({
    source: quoteState.source,
    date: quoteState.date,
    highlightedWords: quoteState.highlightedWords,
    highlightColor: quoteState.highlightColor
  });

  useEffect(() => {
    // If text is fully typed and matches target
    if (quoteState.text === displayText) {
      if (!isMetadataVisible && !quoteState.isGenerating) {
        // Show metadata after typing is complete
        const timer = setTimeout(() => setIsMetadataVisible(true), 200);
        return () => clearTimeout(timer);
      }
      return;
    }

    // If we need to change text, hide metadata first
    if (isMetadataVisible && displayText.length > 0) {
      setIsMetadataVisible(false);
      // Wait for fade out before starting deletion
      const timer = setTimeout(() => {}, 300);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      if (displayText.length > 0 && !quoteState.text.startsWith(displayText)) {
        // Deleting phase
        setDisplayText(prev => prev.slice(0, -1));
      } else if (displayText.length < quoteState.text.length) {
        // Typing phase
        if (displayText === "") {
          // Update metadata exactly when we start typing the new one
          setDisplayMetadata({
            source: quoteState.source,
            date: quoteState.date,
            highlightedWords: quoteState.highlightedWords,
            highlightColor: quoteState.highlightColor
          });
        }
        setDisplayText(quoteState.text.slice(0, displayText.length + 1));
      }
    }, displayText.length > 0 && !quoteState.text.startsWith(displayText) ? 15 : 30);

    return () => clearTimeout(timer);
  }, [quoteState.text, displayText, isMetadataVisible, quoteState.isGenerating]);

  const isGeneratingRef = useRef(false);
  const quoteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  const generateAIQuote = async () => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;
    
    if (quoteTimeoutRef.current) {
      clearTimeout(quoteTimeoutRef.current);
      quoteTimeoutRef.current = null;
    }
    
    try {
      // Use process.env.API_KEY (paid key) if available, fallback to process.env.GEMINI_API_KEY
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{ text: `请从以下3篇随机笔记中摘录一句话：\n\n${
              [...notes]
                .sort(() => 0.5 - Math.random())
                .slice(0, 3)
                .map(n => `标题: ${n.title}\n内容: ${n.content}\n更新时间: ${new Date(n.updatedAt).toLocaleDateString()}`)
                .join('\n\n---\n\n')
            }` }]
          }
        ],
        config: {
          systemInstruction: `你是一个笔记摘录专家。你的任务是从用户的笔记中摘录出最有启发意义的一句话。
启发意义的定义：
1. #发光：用户的观点、金句、思维提升、情绪、能量等。
2. #世界之光：世界最佳实践、诗词、座右铭、名人名句、思维模型、逻辑工具。
3. #身边的光：人际关系、关键人物画像、重要表达观点、重点回应、对你帮助最大的人事物。

要求：
- 摘录的话必须来自提供的笔记内容。
- 这句话不能超过三行（约40-50个汉字以内）。
- 适当插入最多 1 个 emoji，且该 emoji 应紧跟在相关的词汇后面，而不是统一放在句末。
- 识别出句中最重要的 2-3 个词语进行重点标注。
- 摘录的内容统一使用同一种高亮颜色，请根据摘录内容的风格从以下颜色中选择一个最合适的：text-gray-900, text-black, text-gray-800, text-gray-700. 只返回颜色类名。
- 输出格式为JSON。`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "摘录的句子" },
              highlightedWords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "需要重点标注的词语" },
              highlightColor: { type: Type.STRING, description: "高亮颜色类名" },
              source: { type: Type.STRING, description: "笔记标题" },
              date: { type: Type.STRING, description: "更新日期，格式如 2026.03.27" }
            },
            required: ["text", "highlightedWords", "highlightColor", "source", "date"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      
      const newQuote = {
        text: result.text,
        source: result.source,
        date: result.date,
        highlightedWords: result.highlightedWords,
        highlightColor: result.highlightColor || "text-gray-900",
        isGenerating: false
      };
      
      setQuoteState(newQuote);
      setQuoteHistory(prev => [newQuote, ...prev].slice(0, 10));
      retryCountRef.current = 0; // Reset retry count on success
      setIsQuotaExceeded(false);
      
      // Schedule next generation after a 30-second interval
      quoteTimeoutRef.current = setTimeout(() => {
        generateAIQuote();
      }, 30000);
    } catch (error: any) {
      console.error("Failed to generate AI quote:", error);
      
      // Improved rate limit and server error detection
      let isRateLimit = false;
      let isServerError = false;
      const errorStr = typeof error === 'string' ? error : JSON.stringify(error);
      
      if (
        error?.status === 429 || 
        error?.error?.code === 429 || 
        error?.message?.includes('429') || 
        errorStr.includes('429') ||
        errorStr.includes('RESOURCE_EXHAUSTED')
      ) {
        isRateLimit = true;
      }

      if (
        error?.status === 500 ||
        error?.error?.code === 500 ||
        errorStr.includes('500') ||
        errorStr.includes('Internal Server Error')
      ) {
        isServerError = true;
      }
      
      if (isRateLimit) {
        setIsQuotaExceeded(true);
        retryCountRef.current += 1;
        // Exponential backoff: 30s, 60s, 120s, etc. Max 10 minutes.
        const backoffDelay = Math.min(30000 * Math.pow(2, retryCountRef.current - 1), 600000);
        console.log(`Rate limited. Retrying in ${backoffDelay / 1000}s... (Retry #${retryCountRef.current})`);
        
        // If rate limited and no paid key, suggest connecting one
        if (!isPaidKeyConnected) {
          setQuoteState(prev => ({
            ...prev,
            isGenerating: false,
            subtitle: "免费 API 配额已耗尽，建议连接付费 API 以获得更稳定的体验"
          }));
        } else {
          setQuoteState(prev => ({ ...prev, isGenerating: false }));
        }

        quoteTimeoutRef.current = setTimeout(() => {
          generateAIQuote();
        }, backoffDelay);
      } else {
        setIsQuotaExceeded(false);
        // For other errors (including 500), use a fallback quote if we've tried a few times or it's a server error
        if (isServerError || retryCountRef.current > 0) {
          const fallback = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
          setQuoteState({ ...fallback, isGenerating: false });
        } else {
          setQuoteState(prev => ({ ...prev, isGenerating: false }));
        }

        // Standard retry delay for non-rate-limit errors
        quoteTimeoutRef.current = setTimeout(() => {
          generateAIQuote();
        }, 60000);
      }
    } finally {
      isGeneratingRef.current = false;
    }
  };

  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (notes.length > 0 && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      // First generation: immediate
      generateAIQuote();
    } else if (notes.length === 0) {
      setQuoteState({
        text: "来都来了，记个东西\n万一有用呢",
        subtitle: "记下第一条笔记，开启AI摘录",
        isGenerating: false
      });
      hasTriggeredRef.current = false; // Reset if all notes deleted
    }
    
    return () => {
      if (quoteTimeoutRef.current) {
        clearTimeout(quoteTimeoutRef.current);
      }
    };
  }, [notes.length > 0]);

  const [isPaidKeyConnected, setIsPaidKeyConnected] = useState(false);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      // @ts-ignore
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsPaidKeyConnected(hasKey);
      }
    };
    checkApiKey();
  }, []);

  const handleConnectPaidAPI = async () => {
    try {
      // @ts-ignore
      if (window.aistudio && window.aistudio.openSelectKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        setIsPaidKeyConnected(true);
        // After selecting, trigger a refresh
        generateAIQuote();
      }
    } catch (err) {
      console.error("Failed to open key selection:", err);
    }
  };

  const handleManualRefresh = () => {
    setQuoteState(prev => ({
      ...prev,
      isGenerating: true,
      subtitle: "正在重新摘录..."
    }));
    generateAIQuote();
  };

  const getQuoteFontSize = (text: string) => {
    if (text.length < 20) return 'text-[24px]';
    if (text.length < 35) return 'text-[20px]';
    return 'text-[18px]';
  };

  const renderHighlightedText = (text: string, highlightedWords: string[] = []) => {
    if (!highlightedWords.length) return text;
    
    let parts: { text: string; isHighlight: boolean }[] = [{ text, isHighlight: false }];
    
    highlightedWords.forEach(word => {
      const newParts: { text: string; isHighlight: boolean }[] = [];
      parts.forEach(part => {
        if (part.isHighlight) {
          newParts.push(part);
        } else {
          const splitParts = part.text.split(word);
          splitParts.forEach((sp, i) => {
            if (sp) newParts.push({ text: sp, isHighlight: false });
            if (i < splitParts.length - 1) newParts.push({ text: word, isHighlight: true });
          });
        }
      });
      parts = newParts;
    });

    return parts.map((part, i) => (
      <span key={i} className={part.isHighlight ? (displayMetadata.highlightColor || "text-gray-900") : ""}>
        {part.text}
      </span>
    ));
  };
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'notes' | 'notebooks'>('notes');
  const [currentScreen, setCurrentScreen] = useState<'home' | 'editor' | 'notebook_detail'>('home');
  
  // Selection State
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  
  // Modal State
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null);
  const [modalCoverColor, setModalCoverColor] = useState<string>('#E5E7EB');
  const [modalCoverImage, setModalCoverImage] = useState<string | null>(null);
        
  // Bottom Sheet & Multi-select State
  const [isNoteOptionsOpen, setIsNoteOptionsOpen] = useState(false);
  const [selectedNoteForOptions, setSelectedNoteForOptions] = useState<Note | null>(null);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const [isAddToNotebookOpen, setIsAddToNotebookOpen] = useState(false);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [pendingNoteIdForNewNotebook, setPendingNoteIdForNewNotebook] = useState<string | null>(null);
  const [isTagEditorOpen, setIsTagEditorOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [createMenuState, setCreateMenuState] = useState<'default' | 'attachment' | 'external_link' | 'analyzing'>('default');
  const [externalLinkInput, setExternalLinkInput] = useState('');
  const [isParsingLink, setIsParsingLink] = useState(false);
  const [isRecordingOpen, setIsRecordingOpen] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  
  // Analysis & Generation State
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisTarget, setAnalysisTarget] = useState<any>(null);
  
  const [noteForTagEditorId, setNoteForTagEditorId] = useState<string | null>(null);
  const noteForTagEditor = useMemo(() => notes.find(n => n.id === noteForTagEditorId) || null, [notes, noteForTagEditorId]);

  // Long press logic for FAB
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const handlePressStart = () => {
    isLongPressRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setIsRecordingOpen(true);
      setIsCreateMenuOpen(false);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500);
  };

  const handlePressEnd = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
  };

  const handleFabClick = (e: React.MouseEvent) => {
    if (isLongPressRef.current) {
      e.preventDefault();
      return;
    }
    if (activeTab === 'notebooks' && !activeNotebook) {
      openNotebookModal();
    } else if (!isCreateMenuOpen) {
      setCreateMenuState('default');
      setIsCreateMenuOpen(true);
    } else {
      setIsRecordingOpen(true);
      setIsCreateMenuOpen(false);
      setTimeout(() => setCreateMenuState('default'), 200);
    }
  };

  const startAnalysis = (target: any) => {
    setAnalysisTarget(target);
    setCurrentScreen('home'); // Keep home as background or just switch screen
    setCreateMenuState('analyzing');
    setAnalysisProgress(0);
    
    // Simulation of 10 seconds
    const duration = 10000;
    const interval = 100;
    const steps = duration / interval;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const progress = Math.min((currentStep / steps) * 100, 100);
      setAnalysisProgress(progress);
      
      // We need to check if the placeholder exists to know if we should jump
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setNotes(prev => {
          const isViewLater = prev.some(n => n.id.startsWith('generating-'));
          const newNote: Note = {
            id: crypto.randomUUID(),
            title: target.title || '新生成的笔记',
            content: target.generatedContent || '这是AI为您生成的笔记内容总结...',
            tags: target.tags || ['AI生成', '自动整理'],
            notebookId: activeNotebookId,
            updatedAt: Date.now(),
            createdAt: Date.now(),
            images: target.type === 'images' ? ['img1', 'img2', 'img3'] : undefined,
            audioDuration: target.type === 'recording' ? '26:00' : undefined,
            isUnviewed: isViewLater // If it was "view later", mark as unviewed
          };

          if (isViewLater) {
            // Replace placeholder
            return [newNote, ...prev.filter(n => !n.id.startsWith('generating-'))];
          } else {
            // Just add it
            setTimeout(() => {
              setActiveNoteId(newNote.id);
              setCurrentScreen('editor');
              setCreateMenuState('default');
              setIsCreateMenuOpen(false);
            }, 0);
            return [newNote, ...prev];
          }
        });
      }
    }, interval);
    
    return timer;
  };

  const completeAnalysis = (target: any) => {
    // This is now handled inside the interval to check for View Later state
  };

  const handleViewLater = () => {
    if (!analysisTarget) return;
    
    const placeholderNote: Note = {
      id: `generating-${crypto.randomUUID()}`,
      title: analysisTarget.title || '笔记生成中...',
      content: '',
      tags: [],
      notebookId: null,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      isGenerating: true,
      generatingProgress: analysisProgress
    };
    
    setNotes(prev => [placeholderNote, ...prev]);
    setCreateMenuState('default');
    setIsCreateMenuOpen(false);
  };

  // Derived State
  
  const recentTagsForNotebook = useMemo(() => {
    return Array.from(new Set(notes.flatMap(n => n.tags)))
      .slice(0, 6);
  }, [notes]);

  
  const sortTags = (tags: string[]) => {
    return [...tags].sort((a, b) => a.localeCompare(b));
  };

  const activeNote = notes.find(n => n.id === activeNoteId);
  const activeNotebook = notebooks.find(nb => nb.id === activeNotebookId);

  // Handlers
  const handleCreateNote = (notebookId: string | null = null) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      tags: [],
      notebookId: notebookId,
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setCurrentScreen('editor');
  };

  const handleParseExternalLink = async () => {
    if (!externalLinkInput.trim() || isParsingLink) return;
    setIsParsingLink(true);
    
    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Please read the content from this link: ${externalLinkInput} and summarize it in Chinese. Provide a title, tags, and the main body content.`,
        config: {
          tools: [{ urlContext: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "The title of the note" },
              tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Relevant tags for the note" },
              content: { type: Type.STRING, description: "The summarized content of the link" },
              source: { type: Type.STRING, description: "The name of the source platform (e.g., 网页, 小红书, 抖音)" }
            },
            required: ["title", "tags", "content", "source"]
          }
        }
      });
      
      const result = JSON.parse(response.text || "{}");
      
      const newNote: Note = {
        id: crypto.randomUUID(),
        title: result.title || '外部链接解析内容',
        content: result.content || '无法解析该链接的内容。',
        tags: result.tags || ['网页摘录'],
        notebookId: activeNotebookId,
        updatedAt: Date.now(),
        createdAt: Date.now(),
        link: {
          source: result.source || '外部网页',
          url: externalLinkInput
        }
      };
      
      setNotes([newNote, ...notes]);
      setActiveNoteId(newNote.id);
      setExternalLinkInput('');
      setIsCreateMenuOpen(false);
      setTimeout(() => setCreateMenuState('default'), 200);
      setCurrentScreen('editor');
    } catch (error: any) {
      console.error("Failed to parse link:", error);
      
      const errorStr = typeof error === 'string' ? error : JSON.stringify(error);
      const isRateLimit = errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED');
      const isServerError = errorStr.includes('500') || errorStr.includes('Internal Server Error');

      let fallbackTitle = '外部链接解析内容';
      let fallbackContent = '这是从外部链接解析出的正文内容总结。包含了文章的核心观点和主要信息。';
      
      if (isRateLimit) {
        fallbackContent = '由于 API 配额限制，暂时无法自动解析该链接。已为您创建占位笔记，您可以稍后手动编辑或重试。';
      } else if (isServerError) {
        fallbackContent = '服务器暂时繁忙，无法解析该链接。已为您创建占位笔记。';
      }

      // Fallback
      const newNote: Note = {
        id: crypto.randomUUID(),
        title: fallbackTitle,
        content: fallbackContent,
        tags: ['网文', '收藏'],
        notebookId: activeNotebookId,
        updatedAt: Date.now(),
        createdAt: Date.now(),
        link: {
          source: '外部网页',
          url: externalLinkInput
        }
      };
      setNotes([newNote, ...notes]);
      setActiveNoteId(newNote.id);
      setExternalLinkInput('');
      setIsCreateMenuOpen(false);
      setTimeout(() => setCreateMenuState('default'), 200);
      setCurrentScreen('editor');
    } finally {
      setIsParsingLink(false);
    }
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>, skipTimestampUpdate: boolean = false) => {
    setNotes(notes.map(n => n.id === id ? { ...n, ...updates, ...(skipTimestampUpdate ? {} : { updatedAt: Date.now() }) } : n));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    setCurrentScreen(activeNotebookId ? 'notebook_detail' : 'home');
  };

  const openNotebookModal = (notebook: Notebook | null = null) => {
    setEditingNotebook(notebook);
    setModalCoverColor(notebook?.coverColor || NOTEBOOK_COLORS[0]);
    setModalCoverImage(notebook?.coverImage || null);
        setIsNotebookModalOpen(true);
  };

  const handleSaveNotebook = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    saveNotebook(name);
  };

  const saveNotebook = (name: string) => {
    setNotebooks(prevNotebooks => {
      if (editingNotebook) {
        return prevNotebooks.map(nb => nb.id === editingNotebook.id ? {
          ...nb, 
          name, 
          coverColor: modalCoverColor,
          coverImage: modalCoverImage || undefined,
          updatedAt: Date.now()
        } : nb);
      } else {
        return [...prevNotebooks, {
          id: crypto.randomUUID(),
          name,
          coverColor: modalCoverColor,
          coverImage: modalCoverImage || undefined,
          updatedAt: Date.now(),
          createdAt: Date.now()
        }];
      }
    });

    setIsNotebookModalOpen(false);
    setEditingNotebook(null);
  };

  const handleDeleteNotebook = (id: string) => {
    setNotebooks(notebooks.filter(nb => nb.id !== id));
    setNotes(notes.map(n => n.notebookId === id ? { ...n, notebookId: null } : n));
    if (activeNotebookId === id) {
      setActiveNotebookId(null);
      setCurrentScreen('home');
    }
  };



  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Components
  const renderNoteCard = (note: Note, showTags: boolean = false) => {
    return (
      <motion.div 
        layout
        key={note.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={() => {
          if (note.isGenerating) return;
          if (isMultiSelectMode) {
            const newSet = new Set(selectedNoteIds);
            if (newSet.has(note.id)) newSet.delete(note.id);
            else newSet.add(note.id);
            setSelectedNoteIds(newSet);
            return;
          }
          // Flatten the note if it was unviewed
          if (note.isUnviewed) {
            handleUpdateNote(note.id, { isUnviewed: false }, true);
          }
          setActiveNoteId(note.id); 
          setCurrentScreen('editor'); 
        }}
        className={`bg-white rounded-2xl p-4 mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border ${isMultiSelectMode && selectedNoteIds.has(note.id) ? 'border-gray-900 bg-gray-50/50' : 'border-gray-50'} ${note.isGenerating ? 'cursor-default' : 'cursor-pointer'} relative overflow-hidden`}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {note.isGenerating ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent z-10" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-50/30 via-gray-100/30 to-gray-50/30" />
              <div className="relative z-20">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Loader2 size={14} className="text-gray-900 animate-spin" />
                    <span className="text-[11px] font-medium text-gray-900">AI 正在生成中...</span>
                  </div>
                  <Sparkles size={14} className="text-gray-400" />
                </div>
                <h3 className="text-[16px] font-bold text-gray-400 leading-snug">
                  {note.title}
                </h3>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="normal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Folded Corner */}
            {note.isUnviewed && (
              <div className="absolute bottom-0 right-0 w-12 h-12 pointer-events-none z-20">
                {/* Cutout background (matches app background) */}
                <div className="absolute bottom-0 right-0 w-full h-full bg-white" style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }} />
                {/* Fold flap */}
                <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-br from-white to-gray-50 shadow-[-2px_-2px_4px_rgba(0,0,0,0.08)] rounded-tl-lg" style={{ clipPath: 'polygon(100% 0, 0 100%, 0 0)' }} />
                <div className="absolute inset-0 flex items-center justify-center -translate-x-1 -translate-y-1">
                   <span className="text-[9px] font-bold text-yellow-500 -rotate-45">未查看</span>
                </div>
              </div>
            )}

            {isMultiSelectMode && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                 <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedNoteIds.has(note.id) ? 'bg-gray-900 border-gray-900' : 'border-gray-300 bg-white'}`}>
                   {selectedNoteIds.has(note.id) && <Check size={12} className="text-white" />}
                 </div>
              </div>
            )}
            <div className={`${isMultiSelectMode ? 'ml-8' : ''}`}>
              {/* Top row: Updated time and More button */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <span>更新 {formatDate(note.updatedAt)}</span>
                </div>
                {!isMultiSelectMode && (
                  <button className="text-gray-400 p-1 -mr-1 shrink-0 hover:bg-gray-50 rounded-full transition-colors" onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNoteForOptions(note);
                    setIsNoteOptionsOpen(true);
                  }}>
                    <MoreHorizontal size={16} />
                  </button>
                )}
              </div>
              
              {/* Title */}
              <h3 className="text-[16px] font-bold text-gray-900 leading-snug line-clamp-2 mb-2">
                {note.title || '无标题笔记'}
              </h3>
              
              {/* Tags (if shown) */}
              {showTags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {sortTags(note.tags).map(tag => {
                    return (
                      <span key={tag} className="text-gray-900 text-[12px] font-medium flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    );
                  })}
                </div>
              )}
              
              {/* Content */}
              <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-3 mb-3">
                {note.content || '没有内容...'}
              </p>

              {/* Link Card */}
              {note.link && (
                <div className="flex items-center gap-3 bg-white rounded-xl p-3 mb-3 border border-gray-100">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <LinkIcon size={18} className="text-gray-900" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{note.link.source}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{note.link.url}</p>
                  </div>
                </div>
              )}
              
              {/* Attachments (Important Info) */}
              {note.audioDuration ? (
                <div className="flex items-center gap-3 bg-white rounded-xl p-3 w-full border border-gray-100">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 shrink-0">
                    <Mic size={16} />
                  </div>
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-400 w-1/3 rounded-full" />
                  </div>
                  <span className="text-[13px] font-medium text-gray-500 shrink-0">{note.audioDuration}</span>
                </div>
              ) : note.images && note.images.length > 0 ? (
                <div className="flex gap-2">
                  {note.images.slice(0, 3).map((img, idx) => (
                    <div key={idx} className="w-14 h-14 bg-gray-200 rounded-lg shrink-0"></div>
                  ))}
                </div>
              ) : null}
            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const NotebookCard = ({ notebook }: { notebook: Notebook, key?: React.Key }) => {
    const count = notes.filter(n => n.notebookId === notebook.id).length;
    
    return (
      <div 
        onClick={() => { setActiveNotebookId(notebook.id); setCurrentScreen('notebook_detail'); }}
        className="relative ml-2 mb-4 cursor-pointer active:scale-[0.98] transition-transform"
      >
        {/* Binder Rings */}
        <div className="absolute left-0 top-0 bottom-0 w-4 flex flex-col justify-evenly py-4 z-10 -translate-x-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center relative">
              <div className="w-4 h-1.5 bg-gradient-to-b from-gray-300 via-gray-100 to-gray-400 rounded-full shadow-sm border border-gray-300/50 z-10"></div>
              <div className="w-2 h-2 rounded-full bg-gray-50 border border-gray-200 shadow-inner absolute right-0 translate-x-1"></div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden flex flex-col">
          {/* Top Half (Cover) */}
          <div 
            className="h-20 relative shrink-0 p-3 flex flex-col justify-end"
            style={{ backgroundColor: notebook.coverColor || '#E5E7EB' }}
          >
            {notebook.coverImage && (
              <img src={notebook.coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="relative z-10 w-full flex justify-between items-end pl-4">
              <div></div>
              <span className="bg-black/30 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-medium shadow-sm">
                {count} 篇
              </span>
            </div>
          </div>
          
          {/* Bottom Half (Info) */}
          <div className="bg-white p-3 flex flex-col gap-1 relative pl-6">
            <h3 className="font-bold text-[16px] text-gray-900 truncate pr-6">{notebook.name}</h3>
            
            <div className="flex items-center justify-end text-[11px] text-gray-400">
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  openNotebookModal(notebook); 
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors -mr-2 -my-2"
              >
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Renderers
  const renderHome = () => (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {isMultiSelectMode ? (
          <div className="sticky top-0 z-30 flex items-center justify-between px-5 pt-12 pb-4 border-b border-gray-100 bg-white">
            <button onClick={() => { setIsMultiSelectMode(false); setSelectedNoteIds(new Set()); }} className="text-[15px] text-gray-600 font-medium">
              取消
            </button>
            <span className="text-[17px] font-semibold text-gray-900">已选择 {selectedNoteIds.size} 项</span>
            <button 
              onClick={() => {
                if (selectedNoteIds.size === notes.length) {
                  setSelectedNoteIds(new Set());
                } else {
                  setSelectedNoteIds(new Set(notes.map(n => n.id)));
                }
              }} 
              className="text-[15px] text-gray-900 font-medium"
            >
              {selectedNoteIds.size === notes.length ? '全不选' : '全选'}
            </button>
          </div>
        ) : (
          <>
            {/* Top Bar (Sticky) */}
            <div className="sticky top-0 z-30 bg-white px-5 pt-12 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-gray-900">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleConnectPaidAPI}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${isPaidKeyConnected ? 'bg-yellow-50 border-yellow-200 text-yellow-600' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'}`}
                    title={isPaidKeyConnected ? "已连接付费 API" : "连接付费 API"}
                  >
                    <Zap size={20} className={`stroke-[2] ${isPaidKeyConnected ? 'fill-yellow-500' : ''}`} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                    <Search size={20} className="stroke-[2]" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                    <Settings size={20} className="stroke-[2]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Excerpt Area (Scrolls with page) */}
            <div className="px-5 pb-6 relative">
              {isQuotaExceeded && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 text-red-600">
                    <Sparkles size={16} className="shrink-0" />
                    <span className="text-[12px] font-medium">API 配额已耗尽</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isPaidKeyConnected && (
                      <button 
                        onClick={handleConnectPaidAPI}
                        className="text-[11px] font-bold text-red-600 underline underline-offset-2"
                      >
                        连接付费 API
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        retryCountRef.current = 0;
                        handleManualRefresh();
                      }}
                      className="text-[11px] font-bold text-red-600 bg-red-100 px-2 py-1 rounded-md"
                    >
                      立即重试
                    </button>
                  </div>
                </motion.div>
              )}
              <div className="relative h-[160px] flex flex-col justify-center">
                <div className="pr-4">
                  <h2 className={`font-bold text-gray-900 leading-snug mb-3 max-w-[90%] whitespace-pre-line ${getQuoteFontSize(quoteState.text)}`}>
                    {renderHighlightedText(displayText, displayMetadata.highlightedWords)}
                  </h2>
                  
                  <motion.div 
                    initial={false}
                    animate={{ opacity: isMetadataVisible ? 1 : 0, y: isMetadataVisible ? 0 : 5 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex flex-col gap-1"
                  >
                    {quoteState.isGenerating ? (
                      <p className="text-[13px] text-gray-400 animate-pulse whitespace-pre-line">{quoteState.subtitle}</p>
                    ) : displayMetadata.source ? (
                      <div className="flex flex-col gap-1">
                        <p className="text-[13px] text-gray-400 truncate max-w-[250px]">
                          —— 《{displayMetadata.source.length > 15 ? displayMetadata.source.substring(0, 15) + '...' : displayMetadata.source}》
                        </p>
                        <p className="text-[12px] text-gray-400">记于 {displayMetadata.date}</p>
                      </div>
                    ) : (
                      <p className="text-[13px] text-gray-400 whitespace-pre-line">{quoteState.subtitle}</p>
                    )}
                  </motion.div>
                </div>

                {/* View More */}
                {displayMetadata.source && !quoteState.isGenerating && (
                  <div className="absolute right-0 bottom-0">
                    <button 
                      className="flex items-center gap-1 text-[12px] text-gray-400 transition-colors cursor-default"
                    >
                      <ChevronDown size={14} />
                      深度讨论
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs (Sticky) */}
            <div className="sticky top-[104px] z-20 bg-white flex items-center justify-between px-5 py-2 border-b border-gray-100">
              <div className="flex gap-5 items-center">
                <button 
                  onClick={() => { setActiveTab('notes'); setActiveNotebookId(null); }}
                  className={`text-[18px] font-bold transition-colors ${activeTab === 'notes' ? 'text-gray-900' : 'text-gray-300'}`}
                >
                  全部笔记
                </button>
                <button 
                  onClick={() => { setActiveTab('notebooks'); setActiveNotebookId(null); }}
                  className={`text-[18px] font-bold transition-colors ${activeTab === 'notebooks' ? 'text-gray-900' : 'text-gray-300'}`}
                >
                  笔记本
                </button>
              </div>
              <button className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                <Grid size={18} />
              </button>
            </div>
          </>
        )}

        {/* Content List */}
        <div className="px-4 pt-4 pb-32">
          {activeTab === 'notes' ? (
            [...notes].sort((a, b) => b.updatedAt - a.updatedAt).map(note => 
              renderNoteCard(note, false)
            )
          ) : (
            <>
              {notebooks.map(nb => (
                <NotebookCard key={nb.id} notebook={nb} />
              ))}
            </>
          )}
        </div>
      </div>


      {/* Multi-select Bottom Bar */}
      {isMultiSelectMode && activeTab === 'notes' && (
        <div className="absolute bottom-0 left-0 right-0 bg-white z-20 border-t border-gray-100 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-3 px-6 flex items-center justify-around animate-in slide-in-from-bottom">
          <button 
            onClick={() => {
              // Placeholder for bulk move
              setIsMultiSelectMode(false);
              setSelectedNoteIds(new Set());
            }}
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <FolderPlus size={22} />
            <span className="text-[11px] font-medium">移动</span>
          </button>
          <button 
            onClick={() => {
              setNotes(notes.map(n => selectedNoteIds.has(n.id) ? { ...n, readLater: true } : n));
              setIsMultiSelectMode(false);
              setSelectedNoteIds(new Set());
            }}
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <Bookmark size={22} />
            <span className="text-[11px] font-medium">标记未查看</span>
          </button>
          <button 
            onClick={() => {
              setNotes(notes.filter(n => !selectedNoteIds.has(n.id)));
              setIsMultiSelectMode(false);
              setSelectedNoteIds(new Set());
            }}
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-red-600 transition-colors"
          >
            <Trash2 size={22} />
            <span className="text-[11px] font-medium">删除</span>
          </button>
        </div>
      )}
    </div>
  );

  const renderNotebookDetail = () => {
    if (!activeNotebook) return null;
    const notebookNotes = notes.filter(n => n.notebookId === activeNotebook.id);
    
    return (
      <div className="flex flex-col h-full bg-white relative">
        {isMultiSelectMode ? (
          <div className="flex items-center justify-between px-4 pt-12 pb-4 bg-white border-b border-gray-100 shrink-0">
            <button onClick={() => { setIsMultiSelectMode(false); setSelectedNoteIds(new Set()); }} className="text-[15px] text-gray-600 font-medium">
              取消
            </button>
            <span className="text-[17px] font-semibold text-gray-900">已选择 {selectedNoteIds.size} 项</span>
            <button 
              onClick={() => {
                if (selectedNoteIds.size === notebookNotes.length) {
                  setSelectedNoteIds(new Set());
                } else {
                  setSelectedNoteIds(new Set(notebookNotes.map(n => n.id)));
                }
              }} 
              className="text-[15px] text-gray-900 font-medium"
            >
              {selectedNoteIds.size === notebookNotes.length ? '全不选' : '全选'}
            </button>
          </div>
        ) : (
          <div className="relative shrink-0 flex flex-col justify-end pt-12 pb-6 px-6" style={{ backgroundColor: activeNotebook.coverColor || '#E5E7EB' }}>
            {activeNotebook.coverImage && (
              <img src={activeNotebook.coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
            )}
            {/* Header Top Bar */}
            <div className="absolute top-12 left-4 right-4 flex items-center justify-between z-20">
              <button onClick={() => { setCurrentScreen('home'); setActiveNotebookId(null); }} className="p-2 -ml-2 text-white bg-black/20 rounded-full backdrop-blur-md transition-colors hover:bg-black/30">
                <ChevronLeft size={24} />
              </button>
              <button onClick={() => openNotebookModal(activeNotebook)} className="p-2 -mr-2 text-white bg-black/20 rounded-full backdrop-blur-md transition-colors hover:bg-black/30">
                <MoreHorizontal size={24} />
              </button>
            </div>
            
            {/* Header Content */}
            <div className="relative z-10 mt-12 flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-gray-900 bg-white/60 backdrop-blur-md px-3 py-1 rounded-xl w-max max-w-full truncate shadow-sm">{activeNotebook.name}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-white/80 backdrop-blur-md text-gray-700 px-2.5 py-1 rounded-lg text-xs font-medium shadow-sm">
                  {notebookNotes.length} 篇笔记
                </span>
                
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32">
          {notebookNotes.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">这里还没有笔记哦</div>
          ) : (
            [...notebookNotes].sort((a, b) => b.updatedAt - a.updatedAt).map(note => 
              renderNoteCard(note, true)
            )
          )}
        </div>

        {/* Multi-select Bottom Bar */}
        {isMultiSelectMode && (
          <div className="absolute bottom-0 left-0 right-0 bg-white z-20 border-t border-gray-100 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-3 px-6 flex items-center justify-around animate-in slide-in-from-bottom">
            <button 
              onClick={() => {
                // Placeholder for bulk move
                setIsMultiSelectMode(false);
                setSelectedNoteIds(new Set());
              }}
              className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <FolderPlus size={22} />
              <span className="text-[11px] font-medium">移动</span>
            </button>
            <button 
              onClick={() => {
                setNotes(notes.map(n => selectedNoteIds.has(n.id) ? { ...n, isUnviewed: true } : n));
                setIsMultiSelectMode(false);
                setSelectedNoteIds(new Set());
              }}
              className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Bookmark size={22} />
              <span className="text-[11px] font-medium">标记未查看</span>
            </button>
            <button 
              onClick={() => {
                setNotes(notes.filter(n => !selectedNoteIds.has(n.id)));
                setIsMultiSelectMode(false);
                setSelectedNoteIds(new Set());
              }}
              className="flex flex-col items-center gap-1 text-gray-500 hover:text-red-600 transition-colors"
            >
              <Trash2 size={22} />
              <span className="text-[11px] font-medium">删除</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderEditor = () => {
    if (!activeNote) return null;
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center justify-between px-4 pt-12 pb-2">
          <button onClick={() => setCurrentScreen(activeNotebookId ? 'notebook_detail' : 'home')} className="p-2 -ml-2 text-gray-600">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentScreen(activeNotebookId ? 'notebook_detail' : 'home')} className="px-3 py-1.5 text-sm font-medium text-gray-900 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              完成
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">
          <input
            type="text"
            placeholder="输入标题..."
            value={activeNote.title}
            onChange={e => handleUpdateNote(activeNote.id, { title: e.target.value })}
            className="w-full text-2xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 p-0 mb-4 outline-none bg-transparent"
          />
          
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {sortTags(activeNote.tags).map(tag => {
              return (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[13px] font-medium bg-gray-100 text-gray-900">
                  {tag}
                </span>
              );
            })}
            {activeNote.tags.length > 0 ? (
              <button 
                onClick={() => {
                  setNoteForTagEditorId(activeNote.id);
                  setIsTagEditorOpen(true);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Pencil size={14} />
              </button>
            ) : (
              <button 
                onClick={() => {
                  setNoteForTagEditorId(activeNote.id);
                  setIsTagEditorOpen(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[13px] font-medium bg-white border border-gray-100 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <Plus size={14} />
                添加标签
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-6">
            <span>更新 {formatDate(activeNote.updatedAt)}</span>
            <span>·</span>
            <span>创建 {formatDate(activeNote.createdAt)}</span>
            <span>·</span>
            <span>{activeNote.content.length} 字</span>
          </div>

          {activeNote.link && (
            <div className="flex items-center gap-3 bg-white rounded-xl p-4 mb-6 border border-gray-100">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <LinkIcon size={20} className="text-gray-900" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-gray-900 truncate">{activeNote.link.source}</p>
                <p className="text-[13px] text-gray-500 truncate mt-0.5">{activeNote.link.url}</p>
              </div>
            </div>
          )}

          {activeNote.images && activeNote.images.length > 0 && (
            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
              {activeNote.images.map((img, i) => (
                <div key={i} className="w-32 aspect-video bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                  <img src={`https://picsum.photos/seed/podcast${i+1}/200/120`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          )}

          {activeNote.audioDuration && (
            <div className="bg-orange-50 rounded-2xl p-4 mb-6 border border-orange-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white">
                  <PlaySquare size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[13px] font-bold text-orange-900">录音附件</span>
                    <span className="text-[11px] text-orange-600">{activeNote.audioDuration}</span>
                  </div>
                  <div className="h-1.5 bg-orange-200 rounded-full w-full">
                    <div className="h-full bg-orange-500 w-1/3 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <textarea
            placeholder="开始记录..."
            value={activeNote.content}
            onChange={e => handleUpdateNote(activeNote.id, { content: e.target.value })}
            className="w-full h-full min-h-[400px] text-gray-700 text-[16px] leading-relaxed resize-none border-none focus:ring-0 p-0 outline-none bg-transparent"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 w-full bg-white flex items-center justify-center p-0 md:p-4 font-sans overflow-hidden">
      {/* Mobile Simulator Container */}
      <div className="w-full h-full md:h-[844px] md:w-[390px] bg-white md:rounded-[40px] md:shadow-2xl relative overflow-hidden border-0 md:border-[8px] border-gray-900 flex flex-col">
        
        {currentScreen === 'home' && renderHome()}
        {currentScreen === 'notebook_detail' && renderNotebookDetail()}
        {currentScreen === 'editor' && renderEditor()}

        {/* FAB and Create Menu */}
        {currentScreen !== 'editor' && !isMultiSelectMode && (
          <>
            <AnimatePresence>
              {isCreateMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    setIsCreateMenuOpen(false);
                    setTimeout(() => setCreateMenuState('default'), 200);
                  }}
                  className="absolute inset-0 bg-black/40 z-40 pointer-events-auto"
                />
              )}
            </AnimatePresence>

            <div className="absolute bottom-[calc(2.5rem+env(safe-area-inset-bottom))] left-6 right-6 z-50 flex flex-col items-center pointer-events-none">
              <AnimatePresence>
                {isCreateMenuOpen && (
                  <motion.div 
                    layout
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1 }
                    }}
                    className="w-full bg-white/90 backdrop-blur-xl rounded-3xl p-2 mb-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] pointer-events-auto border border-white/50 flex flex-col relative overflow-hidden"
                  >
                    <AnimatePresence mode="popLayout">
                      {createMenuState === 'default' && (
                        <motion.div
                          key="default"
                          variants={{
                            hidden: { opacity: 0, scale: 0.95 },
                            visible: { 
                              opacity: 1, 
                              scale: 1,
                              transition: {
                                duration: 0.2,
                                staggerChildren: 0.06,
                                staggerDirection: -1
                              }
                            }
                          }}
                          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                          className="flex flex-col w-full"
                        >
                        {/* 启发笔记 */}
                        <motion.button 
                          variants={{
                            hidden: { opacity: 0, y: 15, scale: 0.95 },
                            visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 30 } }
                          }}
                          className="p-4 flex items-center gap-4 border-b border-gray-100/50 hover:bg-gray-50/50 transition-colors rounded-t-2xl relative h-[76px]"
                        >
                          {/* 破圈拟人 Icon */}
                          <div className="absolute bottom-2 left-4 w-12 h-16 z-20 pointer-events-none flex items-end justify-center">
                            <motion.div 
                              animate={{ y: [0, -6, 0] }} 
                              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                              className="relative"
                            >
                              {/* AI Stars */}
                              <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-1 -right-2 text-yellow-400"
                              >
                                <Sparkles size={12} fill="currentColor" />
                              </motion.div>
                              <motion.div
                                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.9, 0.4] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                className="absolute top-4 -left-3 text-yellow-400"
                              >
                                <Sparkles size={10} fill="currentColor" />
                              </motion.div>
                              <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.8, 0.3] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute bottom-2 -right-3 text-yellow-400"
                              >
                                <Sparkles size={8} fill="currentColor" />
                              </motion.div>

                              <img 
                                src="https://cdn.phototourl.com/free/2026-03-26-6304bee5-2b6a-4fdd-8b23-75648ac52af8.png" 
                                alt="吉祥物" 
                                referrerPolicy="no-referrer"
                                className="w-14 h-14 object-contain drop-shadow-lg relative z-10"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </motion.div>
                          </div>
                          <div className="w-12 shrink-0" /> {/* Spacer */}
                          <div className="flex flex-col items-start text-left z-10">
                            <span className="font-bold text-[16px] text-gray-900">启发式创作</span>
                            <span className="text-[11px] text-gray-500 mt-0.5">无需指令，AI 问你，好问自然成好文</span>
                          </div>
                        </motion.button>

                        {/* 会议笔记 */}
                        <motion.button 
                          variants={{
                            hidden: { opacity: 0, y: 15, scale: 0.95 },
                            visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 30 } }
                          }}
                          className="p-4 flex items-center gap-4 border-b border-gray-100/50 hover:bg-gray-50/50 transition-colors h-[76px]"
                        >
                          <div className="w-12 flex items-center justify-center shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <Mic size={20} className="text-gray-600" />
                            </div>
                          </div>
                          <div className="flex flex-col items-start text-left">
                            <span className="font-bold text-[15px] text-gray-900">会议笔记</span>
                            <span className="text-[11px] text-gray-500 mt-0.5">边录边记，金句重点智能提炼</span>
                          </div>
                        </motion.button>

                        {/* 附件笔记 */}
                        <motion.button 
                          variants={{
                            hidden: { opacity: 0, y: 15, scale: 0.95 },
                            visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 30 } }
                          }}
                          onClick={() => setCreateMenuState('attachment')}
                          className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors rounded-b-2xl h-[76px]"
                        >
                          <div className="w-12 flex items-center justify-center shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <Link2 size={20} className="text-gray-600" />
                            </div>
                          </div>
                          <div className="flex flex-col items-start text-left">
                            <span className="font-bold text-[15px] text-gray-900">添加附件</span>
                            <span className="text-[11px] text-gray-500 mt-0.5">StripNote / 便签 / 音视频 / 文档 / 链接</span>
                          </div>
                        </motion.button>
                        </motion.div>
                      )}

                      {createMenuState === 'attachment' && (
                        <motion.div 
                          key="attachment"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col h-[480px] w-full"
                        >
                        {/* Selection Header */}
                        <div className="px-4 pt-4 pb-2">
                          <h3 className="text-[15px] font-bold text-gray-900 mb-4">选择</h3>
                          <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                            {[
                              { icon: '💻', label: '远程电脑' },
                              { icon: '🌈', label: 'StripNote' },
                              { icon: '🖼️', label: '相册' },
                              { icon: '✍️', label: '便签' },
                              { icon: '📄', label: '文档' },
                              { icon: '🔗', label: '链接' },
                            ].map((item, i) => (
                              <div 
                                key={i} 
                                className="flex flex-col items-center gap-2 shrink-0 cursor-pointer"
                                onClick={() => {
                                  if (item.label === '链接') {
                                    setCreateMenuState('external_link');
                                  }
                                }}
                              >
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm border border-gray-100">
                                  {item.icon}
                                </div>
                                <span className="text-[11px] text-gray-600 font-medium">{item.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recommendations Section */}
                        <div className="flex-1 bg-white rounded-t-3xl p-4 overflow-y-auto no-scrollbar border-t border-gray-100">
                          <h3 className="text-[15px] font-bold text-gray-900 mb-4">推荐</h3>
                          <div className="space-y-3">
                            {/* Recommendation 1: Photos */}
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center">
                                  <ImageIcon size={12} className="text-gray-900" />
                                </div>
                                <span className="text-[12px] font-medium text-gray-700">昨天新增了一组照片，帮我生成笔记</span>
                              </div>
                              <div className="flex gap-2 mb-4">
                                <div className="flex-1 aspect-video bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                                  <img src="https://picsum.photos/seed/podcast1/200/120" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                                <div className="flex-1 aspect-video bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                                  <img src="https://picsum.photos/seed/podcast2/200/120" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                                <div className="flex-1 aspect-video bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                                  <img src="https://picsum.photos/seed/podcast3/200/120" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[11px] text-gray-400">昨天 16:20</span>
                                <button 
                                  onClick={() => startAnalysis({
                                    type: 'images',
                                    title: '播客录制现场照片回顾',
                                    tags: ['播客', '工作记录', '现场'],
                                    generatedContent: '昨天的播客录制非常顺利。我们讨论了关于未来科技对人类生活影响的话题。现场气氛活跃，嘉宾分享了许多深刻的见解。照片记录了录制过程中的精彩瞬间。'
                                  })}
                                  className="bg-gray-100 text-gray-900 px-4 py-1.5 rounded-full text-[12px] font-bold hover:bg-gray-200 transition-colors"
                                >
                                  生成笔记
                                </button>
                              </div>
                            </div>

                            {/* Recommendation 2: Recording */}
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-5 h-5 rounded-md bg-orange-100 flex items-center justify-center">
                                  <Mic size={12} className="text-orange-600" />
                                </div>
                                <span className="text-[12px] font-medium text-gray-700">刚才新增了1条26min录音，帮我生成笔记</span>
                              </div>
                              <div className="bg-white border border-gray-100 rounded-xl p-3 mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white">
                                    <PlaySquare size={16} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="h-1.5 bg-gray-200 rounded-full w-full overflow-hidden">
                                      <div className="h-full bg-orange-400 w-1/3" />
                                    </div>
                                    <div className="flex justify-between mt-1">
                                      <span className="text-[10px] text-gray-400">08:42</span>
                                      <span className="text-[10px] text-gray-400">26:00</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[11px] text-gray-400">刚刚</span>
                                <button 
                                  onClick={() => startAnalysis({
                                    type: 'recording',
                                    title: '产品周会录音整理',
                                    tags: ['会议', '产品', '录音'],
                                    generatedContent: '本次周会主要讨论了V2.0版本的上线计划。核心任务包括：1. 完成UI最后的走查；2. 修复已知的3个高优Bug；3. 准备应用商店的上架素材。预计下周三进行灰度测试。'
                                  })}
                                  className="bg-gray-100 text-gray-900 px-4 py-1.5 rounded-full text-[12px] font-bold hover:bg-gray-200 transition-colors"
                                >
                                  生成笔记
                                </button>
                              </div>
                            </div>

                            {/* Recommendation 3: PDF */}
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-5 h-5 rounded-md bg-red-100 flex items-center justify-center">
                                  <FileText size={12} className="text-red-600" />
                                </div>
                                <span className="text-[12px] font-medium text-gray-700">刚才下载了1个PDF文档，帮我提炼重点</span>
                              </div>
                              <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 mb-4">
                                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                                  <FileText size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">2026年AI行业发展趋势报告.pdf</p>
                                  <p className="text-xs text-gray-500">4.2 MB</p>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[11px] text-gray-400">10分钟前</span>
                                <button 
                                  onClick={() => startAnalysis({
                                    type: 'pdf',
                                    title: 'AI行业趋势报告核心提炼',
                                    tags: ['行业研究', 'AI', '学习'],
                                    generatedContent: '报告指出：1. 生成式AI将从娱乐转向生产力工具；2. 边缘侧AI算力需求将爆发；3. 数据合规和隐私保护成为核心竞争力。'
                                  })}
                                  className="bg-gray-100 text-gray-900 px-4 py-1.5 rounded-full text-[12px] font-bold hover:bg-gray-200 transition-colors"
                                >
                                  生成笔记
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        </motion.div>
                      )}

                      {createMenuState === 'external_link' && (
                        <motion.div 
                          key="external_link"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="p-4 flex flex-col gap-4 w-full"
                        >
                        <div className="text-center">
                          <h3 className="text-sm font-bold text-gray-900">外部链接</h3>
                          <p className="text-[11px] text-gray-500 mt-1">支持网页、小红书、抖音等链接</p>
                        </div>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={externalLinkInput}
                            onChange={(e) => setExternalLinkInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleParseExternalLink()}
                            placeholder="请粘贴链接..." 
                            disabled={isParsingLink}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all disabled:opacity-50"
                          />
                          <button 
                            onClick={handleParseExternalLink}
                            disabled={isParsingLink || !externalLinkInput.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {isParsingLink ? (
                              <>
                                <RefreshCw size={12} className="animate-spin" />
                                解析中
                              </>
                            ) : '解析'}
                          </button>
                        </div>
                        </motion.div>
                      )}

                      {createMenuState === 'analyzing' && (
                        <motion.div 
                          key="analyzing"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="p-4 flex flex-col gap-4 w-full"
                        >
                          <div className="text-center mb-2">
                            <h3 className="text-sm font-bold text-gray-900">AI 正在生成笔记</h3>
                            <p className="text-[11px] text-gray-500 mt-1">大约需要 5-10 秒不等</p>
                          </div>

                          {/* Progress Steps */}
                          <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${analysisProgress > 30 ? 'bg-green-500 text-white' : 'bg-gray-900 text-white'}`}>
                                {analysisProgress > 30 ? <Check size={12} /> : '1'}
                              </div>
                              <span className="text-[12px] font-medium text-gray-900">读取</span>
                            </div>
                            <div className="w-4 h-px bg-gray-200" />
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${analysisProgress > 70 ? 'bg-green-500 text-white' : analysisProgress > 30 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                {analysisProgress > 70 ? <Check size={12} /> : '2'}
                              </div>
                              <span className="text-[12px] font-medium text-gray-900">分析</span>
                            </div>
                            <div className="w-4 h-px bg-gray-200" />
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${analysisProgress === 100 ? 'bg-green-500 text-white' : analysisProgress > 70 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                '3'
                              </div>
                              <span className="text-[12px] font-medium text-gray-400">生成</span>
                            </div>
                          </div>

                          {/* Content Preview */}
                          <div className="space-y-4 max-h-[30vh] overflow-y-auto">
                            <motion.h1 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: analysisProgress > 20 ? 1 : 0 }}
                              className="text-lg font-bold text-gray-900"
                            >
                              {analysisTarget?.title}
                            </motion.h1>

                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: analysisProgress > 40 ? 1 : 0 }}
                              className="space-y-2"
                            >
                              <h2 className="text-sm font-bold text-gray-800">核心摘要</h2>
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-gray-900 mt-1.5 shrink-0" />
                                  <p className="text-[13px] text-gray-600 leading-relaxed">
                                    {analysisTarget?.generatedContent?.substring(0, 50)}...
                                  </p>
                                </div>
                                {analysisProgress > 60 && (
                                  <div className="flex gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-900 mt-1.5 shrink-0" />
                                    <p className="text-[13px] text-gray-600 leading-relaxed">
                                      基于附件内容，AI 自动识别了关键节点并进行了结构化整理。
                                    </p>
                                  </div>
                                )}
                              </div>
                            </motion.div>

                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: analysisProgress > 80 ? 1 : 0 }}
                              className="space-y-2"
                            >
                              <h2 className="text-sm font-bold text-gray-800">智能标签</h2>
                              <div className="flex gap-2 flex-wrap">
                                {analysisTarget?.tags.map((tag: string) => (
                                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-900 rounded-lg text-[10px] font-medium">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </motion.div>
                          </div>

                          {/* View Later Button */}
                          <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            onClick={handleViewLater}
                            className="w-full bg-gray-900 text-white rounded-2xl py-3.5 font-bold text-[15px] shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:bg-black transition-colors mt-2"
                          >
                            稍后查看
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom Action Bar */}
              <motion.div 
                layout
                initial={false}
                animate={{ 
                  height: createMenuState === 'analyzing' ? 0 : 64,
                  opacity: createMenuState === 'analyzing' ? 0 : 1,
                  marginTop: createMenuState === 'analyzing' ? 0 : 16
                }}
                className="w-full relative pointer-events-none"
              >
                <AnimatePresence>
                  {isCreateMenuOpen && !isRecordingOpen && createMenuState !== 'analyzing' && (
                    <motion.button
                      key="left-btn"
                      initial={{ opacity: 0, scale: 0.5, left: "calc(50% - 32px)" }}
                      animate={{ opacity: 1, scale: 1, left: 0 }}
                      exit={{ opacity: 0, scale: 0.5, left: "calc(50% - 32px)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      onClick={() => { 
                        handleCreateNote(activeNotebook?.id); 
                        setIsCreateMenuOpen(false); 
                        setTimeout(() => setCreateMenuState('default'), 200);
                      }}
                      className="absolute top-0 w-[64px] h-[64px] rounded-full bg-white shadow-[0_8px_20px_rgba(0,0,0,0.08)] flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors shrink-0 pointer-events-auto border border-gray-100/50"
                    >
                      <Pencil size={24} />
                    </motion.button>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {!isRecordingOpen && createMenuState !== 'analyzing' && (
                    <motion.button 
                      key="fab"
                      layoutId="voice-panel"
                      onMouseDown={handlePressStart}
                      onMouseUp={handlePressEnd}
                      onMouseLeave={handlePressEnd}
                      onTouchStart={handlePressStart}
                      onTouchEnd={handlePressEnd}
                      onClick={handleFabClick}
                      initial={false}
                      animate={{
                        width: isCreateMenuOpen ? "calc(100% - 152px)" : 64,
                        left: isCreateMenuOpen ? "76px" : "calc(50% - 32px)",
                        backgroundColor: "#111827",
                        boxShadow: isCreateMenuOpen ? "0 8px 20px rgba(0,0,0,0.2)" : "0 8px 20px rgba(0,0,0,0.3)",
                      }}
                      style={{ borderRadius: 32 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="absolute top-0 h-[64px] flex items-center justify-center overflow-hidden pointer-events-auto"
                    >
                      <AnimatePresence mode="wait">
                        {!isCreateMenuOpen ? (
                          <motion.div
                            key="plus"
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                            transition={{ duration: 0.15 }}
                            className="absolute inset-0 flex items-center justify-center text-white"
                          >
                            <Plus size={32} className="stroke-[2.5]" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="expanded"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="w-full h-full flex items-center justify-center gap-3 text-white"
                          >
                            <img 
                              src="https://cdn.phototourl.com/free/2026-03-27-67c1be21-1d10-4957-bd11-5b7c19abfb2d.png" 
                              alt="想法速记" 
                              referrerPolicy="no-referrer"
                              className="w-6 h-6 shrink-0 object-contain"
                            />
                            <span className="font-bold text-[16px] tracking-wide">想法速记</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {isCreateMenuOpen && !isRecordingOpen && createMenuState !== 'analyzing' && (
                    <motion.button
                      key="right-btn"
                      initial={{ opacity: 0, scale: 0.5, right: "calc(50% - 32px)" }}
                      animate={{ opacity: 1, scale: 1, right: 0 }}
                      exit={{ opacity: 0, scale: 0.5, right: "calc(50% - 32px)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      onClick={() => {
                        if (createMenuState === 'default') {
                          setIsCreateMenuOpen(false);
                        } else if (createMenuState === 'external_link') {
                          setCreateMenuState('attachment');
                        } else {
                          setCreateMenuState('default');
                        }
                      }}
                      className="absolute top-0 w-[64px] h-[64px] rounded-full bg-white shadow-[0_8px_20px_rgba(0,0,0,0.08)] flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors shrink-0 pointer-events-auto border border-gray-100/50"
                    >
                      {createMenuState === 'default' ? <X size={24} /> : <ArrowLeft size={24} />}
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </>
        )}

        {/* Notebook Modal */}
        {isNotebookModalOpen && (
          <div className="absolute inset-0 bg-black/40 flex items-end z-50 animate-in fade-in duration-200">
            <div className="bg-white w-full rounded-t-3xl p-6 pb-[calc(2.5rem+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom-full duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingNotebook ? '编辑笔记本' : '新建笔记本'}
                </h3>
                <button onClick={() => { setIsNotebookModalOpen(false); setEditingNotebook(null); }} className="text-gray-400 p-1">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSaveNotebook} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">笔记本封面</label>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                      {NOTEBOOK_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => { setModalCoverColor(color); setModalCoverImage(null); }}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${modalCoverColor === color && !modalCoverImage ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-100 rounded-xl text-[14px] text-gray-600 font-medium cursor-pointer hover:bg-gray-50 transition-colors">
                        <ImageIcon size={16} />
                        {modalCoverImage ? '更换封面图片' : '上传封面图片'}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setModalCoverImage(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {modalCoverImage && (
                        <button
                          type="button"
                          onClick={() => setModalCoverImage(null)}
                          className="p-2.5 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    {modalCoverImage && (
                      <div className="relative w-full h-24 rounded-xl overflow-hidden mt-1">
                        <img src={modalCoverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <input type="hidden" name="coverColor" value={modalCoverColor} />
                  <input type="hidden" name="coverImage" value={modalCoverImage || ''} />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">笔记本名称</label>
                  <input 
                    type="text" 
                    name="name" 
                    defaultValue={editingNotebook?.name || ''} 
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-100 outline-none transition-all text-[15px]"
                    placeholder="例如：旅行计划"
                  />
                </div>
                
                <div>
                  <div className="flex gap-3">
                    {editingNotebook && (
                      <button
                        type="button"
                        onClick={() => handleDeleteNotebook(editingNotebook.id)}
                        className="flex-1 py-3.5 text-[15px] font-medium text-red-600 bg-red-50 rounded-xl active:bg-red-100 transition-colors"
                      >
                        删除
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-[2] py-3.5 text-[15px] font-medium text-white bg-gray-900 rounded-xl active:bg-black transition-colors shadow-sm shadow-gray-200"
                    >
                      保存
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bottom sheet for note options */}
        {isNoteOptionsOpen && selectedNoteForOptions && (() => {
          const currentNote = notes.find(n => n.id === selectedNoteForOptions.id) || selectedNoteForOptions;
          const belongingNotebooks = notebooks.filter(nb => currentNote.notebookId === nb.id);

          return (
            <div className="absolute inset-0 bg-black/40 flex items-end justify-center z-50 animate-in fade-in duration-200 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]" onClick={() => setIsNoteOptionsOpen(false)}>
              <div className="bg-white w-full max-w-sm rounded-3xl p-2 animate-in slide-in-from-bottom-8 duration-300 shadow-xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-4 pt-3 pb-3 mb-2 border-b border-gray-100">
                  <h3 className="text-[15px] font-semibold text-gray-900 truncate text-center">
                    {currentNote.title || '无标题笔记'}
                  </h3>
                  {/* Metadata Section */}
                  <div className="flex items-center justify-center gap-3 mt-2 text-[11px] text-gray-400">
                    <span>更新 {formatDate(currentNote.updatedAt)}</span>
                    <span>·</span>
                    <span>创建 {formatDate(currentNote.createdAt)}</span>
                    <span>·</span>
                    <span>{currentNote.content.length} 字</span>
                  </div>
                  {/* Tags Section */}
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                    {sortTags(currentNote.tags).map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-medium bg-gray-100 text-gray-900">
                        {tag}
                      </span>
                    ))}
                    <button 
                      onClick={() => {
                        setNoteForTagEditorId(currentNote.id);
                        setIsTagEditorOpen(true);
                        setIsNoteOptionsOpen(false);
                      }}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white text-gray-500 hover:bg-gray-50 transition-colors border border-gray-100"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col px-2">
                  <button 
                    onClick={() => {
                      handleUpdateNote(currentNote.id, { isUnviewed: !currentNote.isUnviewed });
                      setIsNoteOptionsOpen(false);
                    }}
                    className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-gray-50 transition-colors w-full text-left"
                  >
                    <Bookmark size={20} className={currentNote.isUnviewed ? "text-orange-500" : "text-gray-600"} />
                    <span className="text-[15px] font-medium text-gray-700 flex-1">{currentNote.isUnviewed ? '取消未查看' : '标记未查看'}</span>
                  </button>

                  <button 
                    onClick={() => {
                      setIsNoteOptionsOpen(false);
                      setIsMultiSelectMode(true);
                      setSelectedNoteIds(new Set([currentNote.id]));
                    }}
                    className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-gray-50 transition-colors w-full text-left"
                  >
                    <CheckSquare size={20} className="text-gray-600" />
                    <span className="text-[15px] font-medium text-gray-700 flex-1">多选</span>
                  </button>

                  <button 
                    onClick={() => {
                      const duplicate: Note = {
                        ...currentNote,
                        id: crypto.randomUUID(),
                        title: currentNote.title ? `${currentNote.title} (副本)` : '',
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                      };
                      setNotes([duplicate, ...notes]);
                      setIsNoteOptionsOpen(false);
                    }}
                    className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-gray-50 transition-colors w-full text-left"
                  >
                    <Copy size={20} className="text-gray-600" />
                    <span className="text-[15px] font-medium text-gray-700 flex-1">创建副本</span>
                  </button>

                  {belongingNotebooks.length > 0 ? (
                    <button 
                      onClick={() => {
                        setIsRemoveConfirmOpen(true);
                      }}
                      className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-gray-50 transition-colors w-full text-left"
                    >
                      <FolderMinus size={20} className="text-gray-600" />
                      <span className="text-[15px] font-medium text-gray-700 flex-1">移出笔记本</span>
                      <span className="text-[13px] text-gray-400 max-w-[120px] truncate">{belongingNotebooks.map(nb => nb.name).join(', ')}</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setIsAddToNotebookOpen(true);
                      }}
                      className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-gray-50 transition-colors w-full text-left"
                    >
                      <FolderPlus size={20} className="text-gray-600" />
                      <span className="text-[15px] font-medium text-gray-700 flex-1">加笔记本</span>
                    </button>
                  )}

                  <button 
                    onClick={() => {
                      setIsNoteOptionsOpen(false);
                    }}
                    className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-gray-50 transition-colors w-full text-left"
                  >
                    <Share size={20} className="text-gray-600" />
                    <span className="text-[15px] font-medium text-gray-700 flex-1">导出分享</span>
                  </button>

                  <div className="h-px bg-gray-100 my-1 mx-2" />

                  <button 
                    onClick={() => {
                      handleDeleteNote(currentNote.id);
                      setIsNoteOptionsOpen(false);
                    }}
                    className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-red-50 transition-colors w-full text-left group"
                  >
                    <Trash2 size={20} className="text-red-500 group-hover:text-red-600" />
                    <span className="text-[15px] font-medium text-red-500 group-hover:text-red-600 flex-1">删除</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Add to Notebook Modal */}
        {isAddToNotebookOpen && (
          <div className="absolute inset-0 bg-black/40 flex items-end z-[60] animate-in fade-in duration-200" onClick={() => setIsAddToNotebookOpen(false)}>
            <div className="bg-white w-full rounded-t-3xl p-6 pb-[calc(2.5rem+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom-full duration-300 max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">添加到笔记本</h3>
                <button onClick={() => setIsAddToNotebookOpen(false)} className="text-gray-400 p-1 bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 mb-4 no-scrollbar">
                {notebooks.map(nb => (
                  <button
                    key={nb.id}
                    onClick={() => {
                      if (selectedNoteForOptions) {
                        handleUpdateNote(selectedNoteForOptions.id, { notebookId: nb.id });
                      }
                      setIsAddToNotebookOpen(false);
                      setIsNoteOptionsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-900 hover:bg-gray-50 transition-colors text-left"
                  >
                    <Book size={20} className="text-gray-900" />
                    <span className="font-medium text-gray-900">{nb.name}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setIsAddToNotebookOpen(false);
                  setIsNoteOptionsOpen(false);
                  setPendingNoteIdForNewNotebook(selectedNoteForOptions?.id || null);
                  openNotebookModal();
                }}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-colors shrink-0"
              >
                <Plus size={18} />
                新建笔记本
              </button>
            </div>
          </div>
        )}

        {/* Remove Confirm Modal */}
        {isRemoveConfirmOpen && selectedNoteForOptions && (() => {
          const currentNote = notes.find(n => n.id === selectedNoteForOptions.id) || selectedNoteForOptions;
          return (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-[60] animate-in fade-in duration-200 p-6" onClick={() => setIsRemoveConfirmOpen(false)}>
              <div className="bg-white w-full max-w-sm rounded-2xl p-6 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">移出笔记本</h3>
                <p className="text-gray-500 text-[15px] mb-6">
                  确定要将此笔记从笔记本中移出吗？笔记不会被删除，仍可在“全部笔记”中查看。
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsRemoveConfirmOpen(false)}
                    className="flex-1 py-3 text-[15px] font-medium text-gray-700 bg-white border border-gray-100 rounded-xl active:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateNote(currentNote.id, { notebookId: null });
                      setIsRemoveConfirmOpen(false);
                      setIsNoteOptionsOpen(false);
                    }}
                    className="flex-1 py-3 text-[15px] font-medium text-white bg-gray-900 rounded-xl active:bg-black transition-colors"
                  >
                    确定移出
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Tag Editor Panel */}
        {isTagEditorOpen && noteForTagEditor && (
          <TagEditorPanel 
            note={noteForTagEditor} 
            notes={notes}
            notebooks={notebooks}
            onUpdateNote={handleUpdateNote}
            onClose={() => {
              setIsTagEditorOpen(false);
              setNoteForTagEditorId(null);
            }} 
          />
        )}

        {/* Auto-Collect Tag Conflict Modal */}
        

        <VoiceRecordingPanel 
          isOpen={isRecordingOpen} 
          onClose={() => setIsRecordingOpen(false)} 
          onComplete={(duration) => {
            setIsRecordingOpen(false);
            const newNote: Note = {
              id: crypto.randomUUID(),
              title: '想法速记',
              content: '这是一条语音速记内容...',
              tags: ['速记'],
              notebookId: activeNotebookId,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              createDevice: '当前设备',
              updateDevice: '当前设备',
              audioDuration: `${Math.floor(duration / 60).toString().padStart(2, '0')}:${(duration % 60).toString().padStart(2, '0')}`
            };
            setNotes([newNote, ...notes]);
          }} 
        />

        {/* Excerpt History Panel */}
        <AnimatePresence>
          {isExcerptHistoryOpen && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 bg-white z-50 flex flex-col"
            >
              {/* Header */}
              <div className="px-5 pt-12 pb-4 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="text-black font-black italic text-2xl tracking-tighter">
                    //
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">摘录历史</h2>
                </div>
                <button 
                  onClick={() => setIsExcerptHistoryOpen(false)}
                  className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* History List */}
              <div className="flex-1 overflow-y-auto px-5 pb-32">
                <div className="space-y-12 pt-4">
                  {quoteHistory.map((quote, idx) => (
                    <div key={idx} className={`relative ${quote.text === quoteState.text ? 'opacity-100' : 'opacity-40'}`}>
                      <h3 className="text-[20px] font-bold text-gray-900 leading-snug mb-4">
                        {renderHighlightedText(quote.text, quote.highlightedWords)}
                      </h3>
                      <div className="flex flex-col gap-1">
                        <p className="text-[13px] text-gray-400">—— 《{quote.source}》</p>
                        <p className="text-[12px] text-gray-400">记于 {quote.date}</p>
                      </div>
                    </div>
                  ))}
                  {quoteHistory.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">暂无摘录历史</div>
                  )}
                </div>

                {/* AI Chat Suggestions */}
                <div className="mt-16 pt-8 border-t border-gray-100">
                  <div className="flex flex-col gap-3 mb-6">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-[14px] font-medium text-gray-700 w-max shadow-sm">
                      <Pencil size={16} />
                      总结更多关于人群定位的建议
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-[14px] font-medium text-gray-700 w-max shadow-sm">
                      <Book size={16} />
                      在什么情况下记录了这句话？
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-[14px] font-medium text-gray-700 w-max shadow-sm">
                      <Search size={16} />
                      我当时为什么记录了这个
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Input Area */}
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="bg-white border border-gray-100 rounded-2xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-md text-[12px] text-gray-600 font-medium shadow-sm border border-gray-100">
                      <FileText size={12} />
                      {quoteState.source || "当前摘录"}
                      <button className="ml-1 text-gray-400 hover:text-gray-600"><X size={12} /></button>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    placeholder="提问、搜索或创作任何内容" 
                    className="w-full bg-transparent border-none focus:ring-0 text-[15px] p-2 outline-none"
                  />
                  <div className="flex items-center justify-between mt-2 px-2">
                    <div className="flex items-center gap-4 text-gray-400">
                      <FileText size={20} />
                      <FolderPlus size={20} />
                      <LinkIcon size={20} />
                    </div>
                    <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                      <Mic size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

