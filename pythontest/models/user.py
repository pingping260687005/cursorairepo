from dataclasses import dataclass
from typing import Optional

@dataclass
class User:
    """用户模型类"""
    name: str
    age: int
    _id: Optional[str] = None
    
    def to_dict(self):
        """转换为字典格式"""
        user_dict = {
            'name': self.name,
            'age': self.age
        }
        if self._id:
            user_dict['_id'] = self._id
        return user_dict
    
    @classmethod
    def from_dict(cls, data: dict):
        """从字典创建用户对象"""
        return cls(
            name=data.get('name'),
            age=data.get('age'),
            _id=data.get('_id')
        ) 