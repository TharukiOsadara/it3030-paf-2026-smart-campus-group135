import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import java.util.ArrayList;

public class MongoCheck {
    public static void main(String[] args) {
        String uri = "mongodb+srv://admin:fuSHLOrhVYAfv6ez@cluster0.hpo1gtl.mongodb.net/smartcampus?retryWrites=true&w=majority&appName=Cluster0";
        try (MongoClient mongoClient = MongoClients.create(uri)) {
            MongoDatabase database = mongoClient.getDatabase("smartcampus");
            System.out.println("Collections:");
            for (String name : database.listCollectionNames()) {
                System.out.println("- " + name);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
