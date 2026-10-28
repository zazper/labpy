**scikit-learn** offers machine-learning tools with a consistent interface: create a model, `fit` it on data, then `predict`. It is a large library, so the first import takes a while to download.

```python run Fit a line
from sklearn.linear_model import LinearRegression
X = [[1], [2], [3], [4], [5]]
y = [2.1, 3.9, 6.2, 7.8, 10.1]

model = LinearRegression().fit(X, y)
print(round(model.coef_[0], 2), round(model.intercept_, 2))
print(model.predict([[6]]).round(1))
```

## Classifying flowers

```python run A classifier on the iris data
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

model = KNeighborsClassifier(n_neighbors=3).fit(X_train, y_train)
print("accuracy:", round(model.score(X_test, y_test), 2))
```

## Grouping similar points

```python run Clustering with KMeans
from sklearn.cluster import KMeans
points = [[1, 1], [1.5, 2], [1, 0.5], [8, 8], [9, 9], [8.5, 9.5]]
labels = KMeans(n_clusters=2, n_init=10, random_state=0).fit_predict(points)
print(labels)
```

Always check a model on data it has not seen (the test set), as above, to avoid fooling yourself.
