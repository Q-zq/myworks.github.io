import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.metrics import accuracy_score

# 读取数据
df = pd.read_csv('2026_MCM_Problem_C_Data.csv')

# 数据清洗
df = df.dropna()
df['eliminated'] = df['eliminated'].astype(bool)

# 1. 估算观众投票数
# 基于排名和评委分数建立模型来估算观众投票
# 假设观众投票与排名负相关，与评委分数正相关
def estimate_votes(row):
    # 基础投票数
    base_votes = 10000
    # 排名越高（数字越小），观众投票越多
    rank_factor = max(0, 10 - row['rank']) * 1000
    # 分数越高，观众投票越多
    score_factor = row['average_score'] * 500
    # 综合计算
    votes = base_votes + rank_factor + score_factor
    return int(votes)

df['estimated_votes'] = df.apply(estimate_votes, axis=1)

# 2. 检验模型是否能正确预测淘汰结果
# 基于排名和估算的观众投票来预测淘汰
def predict_elimination(row):
    # 排名最后的选手被淘汰
    return row['rank'] == df[(df['season'] == row['season']) & (df['week'] == row['week'])]['rank'].max()

df['predicted_elimination'] = df.apply(predict_elimination, axis=1)

# 计算预测准确率
accuracy = accuracy_score(df['eliminated'], df['predicted_elimination'])
print(f"淘汰预测准确率: {accuracy:.2f}")

# 3. 比较两种投票结合方式
# Rank方法（按排名相加）
def calculate_rank_score(row):
    # 排名越低（数字越小），分数越高
    return 10 - row['rank']

# Percent方法（按百分比相加）
def calculate_percent_score(row):
    # 基于评委分数的百分比
    max_score = df['average_score'].max()
    return (row['average_score'] / max_score) * 10

df['rank_score'] = df.apply(calculate_rank_score, axis=1)
df['percent_score'] = df.apply(calculate_percent_score, axis=1)

# 4. 分析争议案例
# 识别评委低分但观众支持高的选手
disputed_cases = df[(df['average_score'] < df['average_score'].mean()) & (df['estimated_votes'] > df['estimated_votes'].mean())]
print("\n争议案例：")
print(disputed_cases[['season', 'week', 'star_name', 'average_score', 'estimated_votes']])

# 5. 分析明星特征对成绩的影响
# 分析年龄对分数的影响
age_score_corr = df['star_age'].corr(df['average_score'])
print(f"\n年龄与评委分数的相关系数: {age_score_corr:.2f}")

# 分析职业对分数的影响
occupation_score = df.groupby('star_occupation')['average_score'].mean()
print("\n不同职业的平均评委分数:")
print(occupation_score)

# 6. 提出新的投票机制
# 新机制：结合评委分数、观众投票和进步率
def calculate_new_score(row):
    # 获取该选手上一周的分数
    prev_week = row['week'] - 1
    if prev_week > 0:
        prev_score = df[(df['season'] == row['season']) & (df['week'] == prev_week) & (df['star_name'] == row['star_name'])]['average_score']
        if not prev_score.empty:
            improvement = row['average_score'] - prev_score.values[0]
        else:
            improvement = 0
    else:
        improvement = 0
    
    # 新分数计算：60%评委分数 + 30%观众投票（归一化） + 10%进步率
    max_votes = df['estimated_votes'].max()
    normalized_votes = row['estimated_votes'] / max_votes * 10
    new_score = 0.6 * row['average_score'] + 0.3 * normalized_votes + 0.1 * improvement
    return new_score

df['new_score'] = df.apply(calculate_new_score, axis=1)

# 7. 生成分析报告
print("\n=== DWTS数据分析报告 ===")
print(f"1. 淘汰预测准确率: {accuracy:.2f}")
print(f"2. 年龄与评委分数的相关系数: {age_score_corr:.2f}")
print("3. 不同投票方式比较:")
print(f"   Rank方法平均分数: {df['rank_score'].mean():.2f}")
print(f"   Percent方法平均分数: {df['percent_score'].mean():.2f}")
print("4. 争议案例数量:", len(disputed_cases))
print("5. 新投票机制平均分数:", df['new_score'].mean())

# 可视化分析
plt.figure(figsize=(12, 8))

# 评委分数与观众投票的关系
plt.subplot(2, 2, 1)
plt.scatter(df['average_score'], df['estimated_votes'])
plt.title('评委分数与观众投票的关系')
plt.xlabel('评委平均分')
plt.ylabel('估算观众投票数')

# 不同职业的平均分数
plt.subplot(2, 2, 2)
occupation_score.plot(kind='bar')
plt.title('不同职业的平均评委分数')
plt.ylabel('平均分')
plt.xticks(rotation=45)

# 年龄与分数的关系
plt.subplot(2, 2, 3)
plt.scatter(df['star_age'], df['average_score'])
plt.title('年龄与评委分数的关系')
plt.xlabel('年龄')
plt.ylabel('平均分')

# 两种投票方式的比较
plt.subplot(2, 2, 4)
plt.boxplot([df['rank_score'], df['percent_score']], labels=['Rank方法', 'Percent方法'])
plt.title('两种投票方式的比较')
plt.ylabel('分数')

plt.tight_layout()
plt.savefig('dwts_analysis.png')
print("\n分析图表已保存为 dwts_analysis.png")

# 保存分析结果
df.to_csv('dwts_analysis_results.csv', index=False)
print("分析结果已保存为 dwts_analysis_results.csv")