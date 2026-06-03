AGENT_SYSTEM_PROMPT = """
你是一个音乐推荐助手。你的任务是分析用户的请求，并使用可用工具一步步地解决问题。

# 可用工具:
- `get_top_songs(genre: str = None, limit: int = 5)`: 获取当前热门歌曲。可选参数：genre（音乐流派，如“pop”），limit（返回数量，默认5）。
- `recommend_by_preference(preference: str)`: 根据用户喜好（如“我喜欢轻快的流行歌”）推荐合适的歌曲。

# 输出格式要求:
你的每次回复必须严格遵循以下格式，包含一对Thought和Action：

Thought: [你的思考过程和下一步计划]
Action: [你要执行的具体行动]

Action的格式必须是以下之一：
1. 调用工具：function_name(arg_name="arg_value")
2. 结束任务：Finish[最终答案]

# 重要提示:
- 每次只输出一对Thought-Action
- Action必须在同一行，不要换行
- 当收集到足够信息可以回答用户问题时，必须使用 Action: Finish[最终答案] 格式结束

请开始吧！
"""
import requests
import random
TOP_SONGS = {
    "pop": [
        {"title": "Flowers", "artist": "Miley Cyrus", "genre": "pop"},
        {"title": "Cruel Summer", "artist": "Taylor Swift", "genre": "pop"},
        {"title": "Vampire", "artist": "Olivia Rodrigo", "genre": "pop"},
        {"title": "Dance the Night", "artist": "Dua Lipa", "genre": "pop"},
        {"title": "What Was I Made For?", "artist": "Billie Eilish", "genre": "pop"},
    ],
    "rock": [
        {"title": "Seven Nation Army", "artist": "The White Stripes", "genre": "rock"},
        {"title": "Smells Like Teen Spirit", "artist": "Nirvana", "genre": "rock"},
        {"title": "Bohemian Rhapsody", "artist": "Queen", "genre": "rock"},
        {"title": "Hotel California", "artist": "Eagles", "genre": "rock"},
        {"title": "Back in Black", "artist": "AC/DC", "genre": "rock"},
    ],
    "electronic": [
        {"title": "Strobe", "artist": "deadmau5", "genre": "electronic"},
        {"title": "Levels", "artist": "Avicii", "genre": "electronic"},
        {"title": "Sandstorm", "artist": "Darude", "genre": "electronic"},
        {"title": "Animals", "artist": "Martin Garrix", "genre": "electronic"},
        {"title": "Scary Monsters and Nice Sprites", "artist": "Skrillex", "genre": "electronic"},
    ]
}

DEFAULT_TOP = TOP_SONGS["pop"] + TOP_SONGS["rock"] + TOP_SONGS["electronic"]
random.shuffle(DEFAULT_TOP)  #Random sorting, simulating popular situations

# Tool 1: Get popular songs
def get_top_songs(genre: str = None, limit: int = 5) -> str:
    """
   返回热门歌曲列表。可指定流派（pop/rock/electronic）和数量。
    """
    if genre and genre.lower() in TOP_SONGS:
        songs = TOP_SONGS[genre.lower()]
    else:
        songs = DEFAULT_TOP[:limit*2] #Use more to prevent overflow
    top = songs[:limit]
    if not top:
        return "抱歉，没有找到热门歌曲。"
    result = f"当前{' ' + genre + ' ' if genre else ''}热门歌曲 TOP {limit}:\n"
    for i, song in enumerate(top, 1):
        result += f"{i}. {song['title']} - {song['artist']}\n"
    return result

# Tool 2: Recommend based on user preferences
def recommend_by_preference(preference: str) -> str:
    """
    根据用户的描述性喜好，从热门歌曲中筛选匹配的歌曲。
    """
    preference_lower = preference.lower()
    matched = []   # keyword matching
    all_songs = DEFAULT_TOP + sum(TOP_SONGS.values(), [])  #deduplication
    seen = set()
    unique_songs = []
    for s in all_songs:
        key = (s['title'], s['artist'])
        if key not in seen:
            seen.add(key)
            unique_songs.append(s)
    
    # keyword matching
    for song in unique_songs:
        if (preference_lower in song['genre'].lower() or
            any(keyword in song['title'].lower() or keyword in song['artist'].lower() 
                for keyword in preference_lower.split())):
            matched.append(song)
    if not matched:
        # 若无匹配，返回默认热门
        return get_top_songs(limit=3) + "\n（未找到严格匹配，为您推荐当前热门歌曲）"
    result = f"根据您的喜好“{preference}”，为您推荐：\n"
    for i, song in enumerate(matched[:5], 1):
        result += f"{i}. {song['title']} - {song['artist']} ({song['genre']})\n"
    return result

available_tools = {
    "get_top_songs": get_top_songs,
    "recommend_by_preference": recommend_by_preference,
}

from openai import OpenAI
class OpenAICompatibleClient:
    def __init__(self, model: str, api_key: str, base_url: str):
        self.model = model
        self.client = OpenAI(api_key=api_key, base_url=base_url)

    def generate(self, prompt: str, system_prompt: str) -> str:
        print("正在调用大语言模型...")
        try:
            messages = [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': prompt}
            ]
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                stream=False
            )
            answer = response.choices[0].message.content
            print("大语言模型响应成功。")
            return answer
        except Exception as e:
            print(f"调用LLM API时发生错误: {e}")
            return "错误:调用语言模型服务时出错。"

import os
import re

API_KEY = "4148afdcc9ab4cbc885c070ed11592ad.wRs39qO0wIQguqf4"         
BASE_URL = "https://open.bigmodel.cn/api/paas/v4/"        
MODEL_ID = "glm-4-flash"        

llm = OpenAICompatibleClient(
    model=MODEL_ID,
    api_key=API_KEY,
    base_url=BASE_URL
)

user_prompt = "我喜欢节奏轻快的流行歌，帮我推荐几首当前最火的歌曲吧。"
prompt_history = [f"用户请求: {user_prompt}"]

print(f"用户输入: {user_prompt}\n" + "="*40)

for i in range(5):  # 最多5轮
    print(f"--- 循环 {i+1} ---\n")
   
    full_prompt = "\n".join(prompt_history)
    
    llm_output = llm.generate(full_prompt, system_prompt=AGENT_SYSTEM_PROMPT)
   #Truncate excess thought action pairs (to prevent the model from outputting multiple)

    match = re.search(r'(Thought:.*?Action:.*?)(?=\n\s*(?:Thought:|Action:|Observation:)|\Z)', llm_output, re.DOTALL)
    if match:
        truncated = match.group(1).strip()
        if truncated != llm_output.strip():
            llm_output = truncated
            print("已截断多余的 Thought-Action 对")
    print(f"模型输出:\n{llm_output}\n")
    prompt_history.append(llm_output)
    
    action_match = re.search(r"Action: (.*)", llm_output, re.DOTALL)
    if not action_match:
        observation = "错误: 未能解析到 Action 字段。请确保你的回复严格遵循 'Thought: ... Action: ...' 的格式。"
        observation_str = f"Observation: {observation}"
        print(f"{observation_str}\n" + "="*40)
        prompt_history.append(observation_str)
        continue
    action_str = action_match.group(1).strip()
    
    if action_str.startswith("Finish"):
        final_answer = re.match(r"Finish\[(.*)\]", action_str).group(1)
        print(f"任务完成，最终答案: {final_answer}")
        break
    
    tool_name = re.search(r"(\w+)\(", action_str).group(1)
    args_str = re.search(r"\((.*)\)", action_str).group(1)
    kwargs = dict(re.findall(r'(\w+)="([^"]*)"', args_str))
    
    if tool_name in available_tools:
        observation = available_tools[tool_name](**kwargs)
    else:
        observation = f"错误:未定义的工具 '{tool_name}'"
    
    observation_str = f"Observation: {observation}"
    print(f"{observation_str}\n" + "="*40)
    prompt_history.append(observation_str)
