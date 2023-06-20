import random

from flask import g

from crawl_model.wangyi import Wangyi
from models import Song
from nlp_model.dict_analysis import DictAnalysis

wy = Wangyi()
DA = DictAnalysis()


def add_song(song_id, song, singer, cover):
    lyric = wy.get_lyric(song_id)
    lyrics_list = lyric.split('\n')  # 按行切割
    lyrics_list = [line.split(']')[-1] for line in lyrics_list]  # 取出每行的歌词部分
    lyrics_score = [DA.sentiment_sentence(line) for line in lyrics_list]
    item = {
        'id': song_id,
        'song': song,
        'cover': cover,
        'singer': singer,
    }
    comment_info = wy.get_comment(song_id)
    comments = [info['text'] for info in comment_info]
    comment_scores = [DA.sentiment_sentence(comment) for comment in comments]
    scores = (sum(comment_scores) / len(comment_scores)) * 0.3 + (
                sum(lyrics_score) / len(lyrics_score)) * 0.7 if comment_scores and lyrics_score else 0
    item.update({'score': round(scores, 2)})
    return item


def recommends():
    user = g.user
    interval = user.interval
    songs = set(user.songs)
    score = 0
    for song in songs:
        score += float(song.score)
    score = score / len(songs) if len(songs) > 0 else 0
    _songs = set(Song.query.filter(Song.score.between(score - interval, score + interval)).all())
    re_songs = list(_songs - songs)
    # 假设原始列表为 songs
    n = min(12, len(re_songs))  # 随机选取的元素个数
    selected_songs = random.sample(re_songs, n)  # 从列表中随机选取 n 个元素
    return selected_songs, round(score, 2)
