import collections
import jieba

from exts import system


# 词典分析类
class DictAnalysis:
    def __init__(self):
        # 情感词典
        self.sentiment_dict = collections.defaultdict()
        # 否定词词典
        self.not_word_list = []
        # 程度词词典
        self.degree_word_dict = collections.defaultdict()
        # 读取情感词典
        sen_file = open(system + '/music_demo/nlp_model/dict/sentiment_score.txt', 'r+', encoding='utf-8')
        sen_list = sen_file.readlines()
        # 载入词典
        for i in sen_list:
            if len(i.split(' ')) == 2:
                self.sentiment_dict[i.split(' ')[0]] = i.split(' ')[1].strip()
        # 载入否定词
        not_word_file = open(system + '/music_demo/nlp_model/dict/否定词.txt', 'r', encoding='utf-8')
        self.not_word_list = not_word_file.readlines()
        self.not_word_list = [w.strip() for w in self.not_word_list]
        # 载入程度词
        degree_word_file = open(system + '/music_demo/nlp_model/dict/程度副词.txt', 'r', encoding='utf-8')
        degree_word_list = degree_word_file.readlines()
        for i in degree_word_list:
            self.degree_word_dict[i.split(',')[0]] = i.split(',')[1].strip()
        sen_file.close()
        not_word_file.close()
        degree_word_file.close()

    def classify_word(self, word_list):
        sen_word = dict()
        not_word = dict()
        degree_word = dict()
        # 分类
        for word in word_list:
            if word in self.sentiment_dict.keys() \
                    and word not in self.not_word_list \
                    and word not in self.degree_word_dict.keys():
                # 找出分词结果中在情感字典中的词
                sen_word[word] = self.sentiment_dict[word]
            elif word in self.not_word_list \
                    and word not in self.degree_word_dict.keys():
                # 分词结果中在否定词列表中的词
                not_word[word] = -1
            elif word in self.degree_word_dict.keys():
                # 分词结果中在程度副词中的词
                degree_word[word] = self.degree_word_dict[word]
        return sen_word, not_word, degree_word

    # 对句子情感分析
    def sentiment_sentence(self, sentence):
        seq_list = self.seg_word(sentence)
        sen_word, not_word, degree_word = self.classify_word(seq_list)
        score = self.cal_score(sen_word, not_word, degree_word, seq_list)
        return score

    @staticmethod
    def seg_word(sentence):
        seq_list = jieba.lcut(sentence)
        # 停用词构建
        stop_word = set()
        with open(system + '/music_demo/nlp_model/dict/新停用词.txt', 'r+', encoding='utf-8') as fp:
            for i in fp:
                stop_word.add(i.strip())
        return list(filter(lambda x: x not in stop_word, seq_list))

    @staticmethod
    def cal_score(sen_word, not_word, degree_word, seq_list):
        weight = 1
        score = 0
        for i in range(0, len(seq_list)):
            if seq_list[i] in degree_word.keys():
                weight = (weight / weight * float(degree_word[seq_list[i]]))
            elif seq_list[i] in not_word.keys():
                weight *= -1
            elif seq_list[i] in sen_word.keys():
                score += float(weight) * float(sen_word[seq_list[i]])
                weight = 1
        return score
