from enum import Enum


class Currency(str, Enum):
    USD = "USD"
    EUR = "EUR"
    PLN = "PLN"


class Category(str, Enum):
    MOBILE = "mobile"
    CREDIT = "credit"
    OTHER_PAYMENT = "other_payment"
    HOBBY = "hobby"
    SUBSCRIPTION = "subscription"
    TRANSPORT = "transport"
    RESTAURANT = "restaurant"
    UTILITY = "utility"
    SHOPPING = "shopping"
    DEBT = "debt"
