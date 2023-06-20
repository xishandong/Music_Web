import json
import time

import requests
from execjs import compile
from flask import current_app

from exts import system

xx = '010001'
yy = '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7'
zz = '0CoJUm6Qyw8W8jud'
OTHER_COOKIE = 'e302082b51e8da6685dbb3aaf926a6db0267b7bf2fe2b56841d31edd145a3021993166e004087dd3360b2c74791823624d9912ada5e0062f84ee70de9e8757ca6b324248e5c93b0ed4dbf082a8813684'


def replace_lastChar(former_str):
    if len(former_str.split('?')) >= 2:
        replace_char = former_str.split('?')[0]
        return replace_char
    else:
        return former_str


class Wangyi:
    def __init__(self):
        self.headers = {
            'authority': 'music.163.com',
            'accept': '*/*',
            'accept-language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7',
            'referer': 'https://music.163.com/',
            'sec-ch-ua': '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        }
        self.cookies = {
            'MUSIC_U': '5451bcd0097d856694d08b196528b8a9e6d0aedcb45b91a04d02fb9856e6279d993166e004087dd32dd25bf607bc3137c674458b54c3b8c4b8a169e60ca9265e6b6f7b8785862331a0d2166338885bd7',
        }
        self.params = {
            'csrf_token': 'd5e1f281f7b6f7ff2caf0af810f347d7',
        }

    def ajax_request(self, url, _i3x):
        for _ in range(5):
            try:
                param = compile(open(system + '/music_demo/static/js/wangyi.js', 'r', encoding='utf-8').read()) \
                    .call('d', json.dumps(_i3x, separators=(',', ':')), xx, yy, zz)
                data = {
                    'params': param['encText'],
                    'encSecKey': param['encSecKey']
                }
                resp = requests.post(url, headers=self.headers, params=self.params, cookies=self.cookies,
                                     data=data, timeout=10).json()
                return resp
            except requests.exceptions.RequestException as e:
                current_app.logger.error('ajax_request: %s', str(e))
                time.sleep(5)
        else:
            return {}

    def search(self, name, offset):
        _i3x = {
            "hlpretag": "<span class=\"s-fc7\">",
            "hlposttag": "</span>",
            "id": "160947",
            "s": name,
            "type": "1",
            "offset": str(offset),
            "total": "true",
            "limit": "30",
            "csrf_token": ""
        }
        url = 'https://music.163.com/weapi/cloudsearch/get/web'
        response = self.ajax_request(url=url, _i3x=_i3x)
        songs = response.get('result', {}).get('songs')
        if songs:
            return [{
                'type': 'wy',
                'id': song.get('id'),
                'name': song.get('name'),
                'singer': song.get('ar', [{}])[0].get('name'),
                'album': song.get('al', {}).get('name'),
                'cover_url': song.get('al', {}).get('picUrl')
            } for song in songs]

    def get_lyric(self, id):
        _i3x = {
            "id": id,
            "lv": -1,
            "tv": -1,
            "csrf_token": ""
        }
        response = self.ajax_request('https://music.163.com/weapi/song/lyric', _i3x)
        lyric_1 = response.get('lrc', {}).get('lyric')
        return lyric_1

    def get_comment(self, id, times=-1):
        i3x = {
            'csrf_token': "",
            'cursor': str(times),
            'offset': "0",
            'orderType': "1",
            'pageNo': "1",
            'pageSize': "20",
            'rid': f"R_SO_4_{id}",
            'threadId': f"R_SO_4_{id}",
        }
        datas = self.ajax_request('https://music.163.com/weapi/comment/resource/comments/get', i3x)
        hotComments = datas.get('data', {}).get('hotComments') if datas.get('data', {}).get('hotComments') else []
        commonComments = datas["data"]["comments"]
        allComments = hotComments + commonComments if times == -1 else commonComments
        return [{
            'user': info.get('user', {}).get('nickname'),
            'createTime': info.get('timeStr'),
            'likeCount': info.get('likedCount'),
            'text': info.get('content'),
            'time': info.get('time')
        } for info in allComments]

    def get_musicUrl(self, mid):
        i3x = {
            "ids": f"[{mid}]",
            "level": "standard",
            "encodeType": "aac",
            "csrf_token": ""
        }
        response = self.ajax_request('https://music.163.com/weapi/song/enhance/player/url/v1', i3x)
        Url = response.get("data", [{}])[0].get('url')
        if not Url and self.cookies['MUSIC_U'] != OTHER_COOKIE:
            self.cookies['MUSIC_U'] = OTHER_COOKIE
            return self.get_musicUrl(mid)
        else:
            return replace_lastChar(Url) if Url else None

    def get_everyday_recommend(self):
        _i3x = {
            "offset": "0",
            "total": "true",
            "csrf_token": self.params['csrf_token']
        }
        self.cookies['MUSIC_U'] = OTHER_COOKIE
        resp = self.ajax_request(url='https://music.163.com/weapi/v2/discovery/recommend/songs', _i3x=_i3x)
        songs = resp['recommend']
        if songs:
            return [{
                'type': 'wy',
                'id': song.get('id'),
                'name': song.get('name'),
                'singer': song.get('artists', [{}])[0].get('name'),
                'album': song.get('album', {}).get('name'),
                'cover_url': song.get('album', {}).get('picUrl')
            } for song in songs]
