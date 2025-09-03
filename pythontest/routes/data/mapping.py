import os
import json
import pandas as pd
from flask import Blueprint, request, jsonify

mapping_bp = Blueprint('mapping', __name__, url_prefix='/api/mapping')
MAPPING_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'mapping.csv')

# 读取 mapping.csv（pandas 版）
@mapping_bp.route('', methods=['GET'])
def get_mapping():
    if not os.path.exists(MAPPING_FILE):
        return jsonify({'field_mapping': {}, 'key_fields': []})
    df = pd.read_csv(MAPPING_FILE, dtype=str).fillna('')
    # field_mapping: {source1: {target, desc}}
    field_mapping = {
        row['source1']: {
            'target': row['source2'],
            'desc': row.get('desc', '')
        }
        for _, row in df.iterrows()
    }
    key_fields = df.loc[df['is_key'].str.lower() == 'yes', 'source1'].tolist()
    return jsonify({'field_mapping': field_mapping, 'key_fields': key_fields})

# 修改 mapping.csv（pandas 版）
@mapping_bp.route('', methods=['PUT', 'POST'])
def update_mapping():
    data = request.get_json(force=True)
    field_mapping = data.get('field_mapping', {})
    key_fields = data.get('key_fields', [])

    # 读取现有 mapping.csv 以保留 desc
    if os.path.exists(MAPPING_FILE):
        df = pd.read_csv(MAPPING_FILE, dtype=str).fillna('')
    else:
        df = pd.DataFrame(columns=['source1', 'source2', 'desc', 'is_key'])

    # 更新 source2 和 is_key
    df['source2'] = df['source1'].map(lambda x: field_mapping.get(x, df.loc[df['source1'] == x, 'source2'].values[0] if not df.loc[df['source1'] == x, 'source2'].empty else ''))
    df['is_key'] = df['source1'].map(lambda x: 'yes' if x in key_fields else 'no')

    # 补充 field_mapping 中的新字段
    for src, tgt in field_mapping.items():
        if src not in df['source1'].values:
            df = pd.concat([
                df,
                pd.DataFrame([{'source1': src, 'source2': tgt, 'desc': '', 'is_key': 'yes' if src in key_fields else 'no'}])
            ], ignore_index=True)

    df = df[['source1', 'source2', 'desc', 'is_key']]
    df.to_csv(MAPPING_FILE, index=False, encoding='utf-8')
    return jsonify({'status': 'success'})
