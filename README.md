# 日事清分析程序

## demo版本

## beta版本

调用beta版本，`npm run beta`

## prod版本

windows下，`npm run prod`

```
select min(t.id), count(t.super_user_id)
from `user` t group by t.super_user_id having count(t.super_user_id) > 1
order by count(t.super_user_id) desc 
```