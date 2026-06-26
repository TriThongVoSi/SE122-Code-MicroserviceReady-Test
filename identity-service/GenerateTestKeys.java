
import java.io.FileWriter;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Base64;

public class GenerateTestKeys {
    public static void main(String[] args) throws Exception {
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
        keyGen.initialize(2048);
        KeyPair keyPair = keyGen.generateKeyPair();
        
        PrivateKey privateKey = keyPair.getPrivate();
        PublicKey publicKey = keyPair.getPublic();
        
        // Write private key
        try (FileWriter fw = new FileWriter("src/test/resources/test-keys/rsa-private.pem")) {
            fw.write("-----BEGIN PRIVATE KEY-----\n");
            fw.write(Base64.getMimeEncoder(64, new byte[]{'\n'}).encodeToString(privateKey.getEncoded()));
            fw.write("\n-----END PRIVATE KEY-----\n");
        }
        
        // Write public key
        try (FileWriter fw = new FileWriter("src/test/resources/test-keys/rsa-public.pem")) {
            fw.write("-----BEGIN PUBLIC KEY-----\n");
            fw.write(Base64.getMimeEncoder(64, new byte[]{'\n'}).encodeToString(publicKey.getEncoded()));
            fw.write("\n-----END PUBLIC KEY-----\n");
        }
        
        System.out.println("Test keys generated successfully!");
    }
}
