import csv
import math
from collections import defaultdict

# 读取数据
data = []
with open('2026_MCM_Problem_C_Data.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        # 转换数据类型
        row['season'] = int(row['season'])
        row['week'] = int(row['week'])
        row['star_age'] = int(row['star_age'])
        row['judge_score_1'] = float(row['judge_score_1'])
        row['judge_score_2'] = float(row['judge_score_2'])
        row['judge_score_3'] = float(row['judge_score_3'])
        row['judge_score_4'] = float(row['judge_score_4'])
        row['average_score'] = float(row['average_score'])
        row['rank'] = int(row['rank'])
        row['eliminated'] = row['eliminated'].lower() == 'true'
        data.append(row)

# 1. 估算观众投票数
def estimate_votes(row):
    base_votes = 10000
    rank_factor = max(0, 10 - row['rank']) * 1000
    score_factor = row['average_score'] * 500
    votes = base_votes + rank_factor + score_factor
    return int(votes)

for row in data:
    row['estimated_votes'] = estimate_votes(row)

# 2. 检验模型是否能正确预测淘汰结果
def predict_elimination(row, data):
    max_rank = 0
    for r in data:
        if r['season'] == row['season'] and r['week'] == row['week']:
            if r['rank'] > max_rank:
                max_rank = r['rank']
    return row['rank'] == max_rank

correct_predictions = 0
for row in data:
    row['predicted_elimination'] = predict_elimination(row, data)
    if row['eliminated'] == row['predicted_elimination']:
        correct_predictions += 1

accuracy = correct_predictions / len(data)
print(f"淘汰预测准确率: {accuracy:.2f}")

# 3. 比较两种投票结合方式
def calculate_rank_score(row):
    return 10 - row['rank']

def calculate_percent_score(row, max_score):
    return (row['average_score'] / max_score) * 10

max_score = max(row['average_score'] for row in data)
for row in data:
    row['rank_score'] = calculate_rank_score(row)
    row['percent_score'] = calculate_percent_score(row, max_score)

# 4. 分析争议案例
mean_score = sum(row['average_score'] for row in data) / len(data)
mean_votes = sum(row['estimated_votes'] for row in data) / len(data)
disputed_cases = [row for row in data if row['average_score'] < mean_score and row['estimated_votes'] > mean_votes]

print("\n争议案例：")
print("season, week, star_name, average_score, estimated_votes")
for case in disputed_cases:
    print(f"{case['season']}, {case['week']}, {case['star_name']}, {case['average_score']:.2f}, {case['estimated_votes']}")

# 5. 分析明星特征对成绩的影响
# 分析年龄对分数的影响
def calculate_correlation(x, y):
    n = len(x)
    sum_x = sum(x)
    sum_y = sum(y)
    sum_xy = sum(x[i] * y[i] for i in range(n))
    sum_x2 = sum(x[i]**2 for i in range(n))
    sum_y2 = sum(y[i]**2 for i in range(n))
    
    numerator = n * sum_xy - sum_x * sum_y
    denominator = math.sqrt((n * sum_x2 - sum_x**2) * (n * sum_y2 - sum_y**2))
    
    if denominator == 0:
        return 0
    return numerator / denominator

ages = [row['star_age'] for row in data]
scores = [row['average_score'] for row in data]
age_score_corr = calculate_correlation(ages, scores)
print(f"\n年龄与评委分数的相关系数: {age_score_corr:.2f}")

# 分析职业对分数的影响
occupation_scores = defaultdict(list)
for row in data:
    occupation_scores[row['star_occupation']].append(row['average_score'])

print("\n不同职业的平均评委分数:")
for occupation, scores in occupation_scores.items():
    avg_score = sum(scores) / len(scores)
    print(f"{occupation}: {avg_score:.2f}")

# 6. 提出新的投票机制
def calculate_new_score(row, data):
    prev_week = row['week'] - 1
    improvement = 0
    if prev_week > 0:
        for r in data:
            if r['season'] == row['season'] and r['week'] == prev_week and r['star_name'] == row['star_name']:
                improvement = row['average_score'] - r['average_score']
                break
    
    max_votes = max(r['estimated_votes'] for r in data)
    normalized_votes = (row['estimated_votes'] / max_votes) * 10
    new_score = 0.6 * row['average_score'] + 0.3 * normalized_votes + 0.1 * improvement
    return new_score

for row in data:
    row['new_score'] = calculate_new_score(row, data)

# 7. 生成分析报告
print("\n=== DWTS数据分析报告 ===")
print(f"1. 淘汰预测准确率: {accuracy:.2f}")
print(f"2. 年龄与评委分数的相关系数: {age_score_corr:.2f}")

rank_scores = [row['rank_score'] for row in data]
percent_scores = [row['percent_score'] for row in data]
print("3. 不同投票方式比较:")
print(f"   Rank方法平均分数: {sum(rank_scores)/len(rank_scores):.2f}")
print(f"   Percent方法平均分数: {sum(percent_scores)/len(percent_scores):.2f}")

print("4. 争议案例数量:", len(disputed_cases))

new_scores = [row['new_score'] for row in data]
print("5. 新投票机制平均分数:", sum(new_scores)/len(new_scores))

# 8. 分析哪种投票方式更偏向观众投票
# 计算两种方法与观众投票的相关性
votes = [row['estimated_votes'] for row in data]
rank_corr = calculate_correlation(rank_scores, votes)
percent_corr = calculate_correlation(percent_scores, votes)

print("\n6. 投票方式与观众投票的相关性:")
print(f"   Rank方法: {rank_corr:.2f}")
print(f"   Percent方法: {percent_corr:.2f}")
print(f"   {'Rank方法' if rank_corr > percent_corr else 'Percent方法'}更偏向观众投票")

# 9. 分析争议案例的不同投票方式结果
print("\n7. 争议案例的不同投票方式结果:")
print("star_name, rank_score, percent_score, new_score")
for case in disputed_cases:
    print(f"{case['star_name']}, {case['rank_score']:.2f}, {case['percent_score']:.2f}, {case['new_score']:.2f}")

# 保存分析结果
with open('dwts_analysis_results.csv', 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['season', 'week', 'star_name', 'star_age', 'star_occupation', 'partner_name',
                  'judge_score_1', 'judge_score_2', 'judge_score_3', 'judge_score_4',
                  'average_score', 'rank', 'eliminated', 'estimated_votes',
                  'predicted_elimination', 'rank_score', 'percent_score', 'new_score']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for row in data:
        writer.writerow(row)

print("\n分析结果已保存为 dwts_analysis_results.csv")